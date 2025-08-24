const socket = io();

console.log("Conectado ao servidor de socket");

let currentUser = null;

async function fetchCurrentUser() {
  try {
    const res = await fetch("/api/users/current");
    if (res.ok) {
      currentUser = await res.json();
      console.log("Usuário logado:", currentUser);
    } else {
      console.warn("Não logado");
    }
  } catch (e) {
    console.error("Erro ao buscar current user:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchCurrentUser().catch(() => null);
});

const loadProductsButton = document.getElementById("loadProductsButton");
const productsList = document.getElementById("productsList");
productsList.addEventListener("click", async (e) => {
  const btn = e.target.closest(".add-to-cart-btn");
  if (!btn) return;

  const card = btn.closest(".product-card");
  const productId = btn.dataset.productId;
  const qtyInput = card.querySelector(".product-qty");
  let quantity = parseInt(qtyInput.value, 10);

  // saneamento da quantidade
  if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;

  // garante usuário carregado
  if (!currentUser) {
    await fetchCurrentUser().catch(() => null);
  }
  const userId = currentUser?.id || currentUser?._id;
  if (!userId) {
    window.location.href = "/login";
    return;
  }

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = "Adicionando...";

  try {
    // tua rota: /api/carts/:uid/:pid/:quantity
    const url = `/api/carts/${encodeURIComponent(userId)}/${encodeURIComponent(
      productId
    )}/${encodeURIComponent(quantity)}`;

    const res = await fetch(url, {
      method: "POST",
      // não precisa body/json porque a rota usa params
      // headers/credentials default já bastam para mesma origem
    });

    const text = await res.text(); // útil para depurar mensagens do back
    if (!res.ok) throw new Error(text || "Falha ao adicionar ao carrinho");

    btn.textContent = "Adicionado ✓";
    const stockLi = card.querySelector(".list-group-item:nth-child(3)");
    // OBS: na tua UL a ordem é: Código, Preço, Estoque, Categoria, Status
    if (stockLi) {
      const oldStock = parseInt(stockLi.textContent.replace(/\D/g, ""), 10);
      if (!isNaN(oldStock)) {
        const newStock = oldStock - quantity;
        stockLi.innerHTML = `<strong>Estoque:</strong> ${newStock}`;
      }
    }
  } catch (error) {
    btn.textContent = originalText;
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = originalText;
    }, 1200);
  }
});

loadProductsButton.addEventListener("click", async () => {
  console.log("Carregando produtos...");
  await renderProducts();
});

socket.on("productsUpdated", async () => {
  console.log("Lista de produtos atualizada");
  await renderProducts();
});

async function renderProducts() {
  await fetchCurrentUser();
  try {
    const response = await fetch("/api/products");

    const { products } = await response.json();

    productsList.innerHTML = "";
    products.forEach((product) => {
      renderProduct(product);
    });
    console.log("Produtos renderizados:", products);
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}

function renderProduct(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const imgSrc =
    product.thumbnail || "https://via.placeholder.com/300x180?text=Produto";
  const statusTxt = product.status ? "Ativo" : "Inativo";

  card.innerHTML = `
    <div class="card h-100">
      <img src="${imgSrc}" alt="${
    product.title
  }" class="card-img-top" style="max-height: 180px; object-fit: cover;">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${product.title}</h5>
        <p class="card-text">${product.description || ""}</p>
        <ul class="list-group list-group-flush mb-3">
          <li class="list-group-item"><strong>Código:</strong> ${
            product.code || "-"
          }</li>
          <li class="list-group-item"><strong>Preço:</strong> R$ ${
            product.price?.toFixed ? product.price.toFixed(2) : product.price
          }</li>
          <li class="list-group-item"><strong>Estoque:</strong> ${
            product.stock ?? "-"
          }</li>
          <li class="list-group-item"><strong>Categoria:</strong> ${
            product.category || "-"
          }</li>
          <li class="list-group-item"><strong>Status:</strong> ${statusTxt}</li>
        </ul>

        <div class="d-flex align-items-center gap-2 mt-auto">
          <label for="qty-${
            product._id
          }" class="form-label m-0 small">Qtd</label>
          <input type="number"
                 id="qty-${product._id}"
                 class="form-control form-control-sm product-qty"
                 value="1" min="1" step="1"
                 style="width: 90px;" inputmode="numeric" />

          <button type="button"
                  class="btn btn-sm btn-success add-to-cart-btn"
                  data-product-id="${product._id}">
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  `;

  productsList.appendChild(card);
}

const loadUsersButton = document.getElementById("loadUsersButton");
const usersList = document.getElementById("usersList");

loadUsersButton.addEventListener("click", async () => {
  console.log("Carregando usuários...");
  await renderUsers();
});

socket.on("usersUpdated", async () => {
  console.log("Lista de usuários atualizada");
  await renderUsers();
});

async function renderUsers() {
  try {
    const response = await fetch("/api/users");
    console.log(response);

    switch (response.status) {
      case 200:
        const { users } = await response.json();
        usersList.innerHTML = "";
        users.forEach((user) => {
          renderUser(user);
        });
        console.log("Usuários renderizados:", users);
        break;
      case 401:
        console.error("Sem autorização para buscar usuários");
        window.location.href = "/login";
        break;
      case 404:
        console.error("Usuários não encontrados");
        break;
      case 500:
        console.error("Erro interno do servidor");
        break;
      default:
        console.error("Erro desconhecido");
    }
  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
  }
}

function renderUser(user) {
  // Cria um card estilizado usando template literals para HTML
  const card = document.createElement("div");
  card.className = "user-card";
  card.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">${user.first_name} ${user.last_name}</h5>
        <p class="card-text">${user.email}</p>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>ID:</strong> ${user._id}</li>
          <li class="list-group-item"><strong>Data de Nascimento:</strong> ${user.birth}</li>
          <li class="list-group-item"><strong>Role:</strong> ${user.role}</li>
        </ul>
      </div>
    </div>
  `;
  usersList.appendChild(card);
}
