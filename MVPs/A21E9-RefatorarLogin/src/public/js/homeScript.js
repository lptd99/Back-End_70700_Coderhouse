const socket = io();

console.log("Conectado ao servidor de socket");

const loadProductsButton = document.getElementById("loadProductsButton");
const productsList = document.getElementById("productsList");

loadProductsButton.addEventListener("click", async () => {
  console.log("Carregando produtos...");
  await renderProducts();
});

socket.on("productsUpdated", async () => {
  console.log("Lista de produtos atualizada");
  await renderProducts();
});

async function renderProducts() {
  try {
    const response = await fetch("/api/products");
    console.log(response);

    const { products } = await response.json();
    console.log("Produtos recebidos:", products);
    console.log("Produto 1:", products[0]);

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
  // Cria um card estilizado usando template literals para HTML
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <div class="card">
      <img src="${product.thumbnail}" alt="${
    product.title
  }" class="card-img-top" style="max-height: 180px; object-fit: cover;">
      <div class="card-body">
        <h5 class="card-title">${product.title}</h5>
        <p class="card-text">${product.description}</p>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>Código:</strong> ${
            product.code
          }</li>
          <li class="list-group-item"><strong>Preço:</strong> R$ ${
            product.price
          }</li>
          <li class="list-group-item"><strong>Estoque:</strong> ${
            product.stock
          }</li>
          <li class="list-group-item"><strong>Categoria:</strong> ${
            product.category
          }</li>
          <li class="list-group-item"><strong>Status:</strong> ${
            product.status ? "Ativo" : "Inativo"
          }</li>
        </ul>
      </div>
    </div>
  `;
  productsList.appendChild(card);
}
