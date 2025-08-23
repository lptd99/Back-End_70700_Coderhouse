const socket = io();

// --- Utils UI ---
function showToast(type, message) {
  const wrap = document.getElementById("toastArea");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = `alert alert-${type} alert-dismissible fade show mt-2`;
  el.role = "alert";
  el.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.remove("show");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
  }, 2500);
}

function money(n) {
  const v = Number(n || 0);
  return v.toFixed(2).replace(".", ",");
}

// --- Estado ---
let currentUser = null;
let items = []; // [{ _id: pid, title, price, stock, quantity }]

// --- Fetch current user (fallback se window.userId não vier) ---
async function fetchCurrentUser() {
  if (window.userId) {
    currentUser = { id: window.userId };
    return currentUser;
  }
  const res = await fetch("/api/users/current");
  if (!res.ok) throw new Error("Não logado");
  currentUser = await res.json();
  return currentUser;
}

// --- Carregar carrinho do usuário ---
async function fetchCart() {
  const uid = currentUser?.id || currentUser?._id;
  if (!uid) throw new Error("Usuário não identificado");
  // Sua função getProductsFromCart usa req.params.uid.
  // Adotei caminho: GET /api/carts/:uid/products  → { products: [{ product, quantity }] }
  // Se o seu router usar outro path, ajuste aqui.
  const res = await fetch(`/api/carts/${encodeURIComponent(uid)}/products`, {
    method: "GET",
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();

  // Normaliza itens para render
  items = (data.products || []).map((row) => {
    const p = row.product || row; // caso já venha populado
    return {
      _id: p._id || row.product?._id,
      title: p.title,
      price: p.price,
      stock: p.stock, // importante pro +/-
      quantity: row.quantity, // qty no carrinho
      thumbnail: p.thumbnail,
    };
  });
}

// --- Render ---
function render() {
  const tbody = document.getElementById("cartList");
  tbody.innerHTML = "";

  let total = 0;

  items.forEach((it) => {
    const subtotal = Number(it.price) * Number(it.quantity);
    total += subtotal;

    const tr = document.createElement("tr");
    tr.dataset.pid = it._id;
    tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${
            it.thumbnail || "https://via.placeholder.com/60x40?text=IMG"
          }" alt="${
      it.title
    }" style="width:60px;height:40px;object-fit:cover;border-radius:6px">
          <div class="fw-semibold">${it.title}</div>
        </div>
      </td>
      <td class="text-end">${money(it.price)}</td>
      <td class="text-center"><span class="badge bg-${
        it.stock > 0 ? "secondary" : "danger"
      } stock-badge">${it.stock ?? 0}</span></td>
      <td class="text-center">
        <div class="btn-group btn-group-sm" role="group" aria-label="qty">
          <button class="btn btn-outline-secondary btn-minus" ${
            it.quantity <= 1 ? "disabled" : ""
          }>−</button>
          <span class="px-2 qty-label">${it.quantity}</span>
          <button class="btn btn-outline-secondary btn-plus" ${
            it.quantity >= it.stock ? "disabled" : ""
          }>+</button>
        </div>
      </td>
      <td class="text-end subtotal-cell">${money(subtotal)}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-danger btn-remove">Remover</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("cartTotal").textContent = money(total);
}

// --- Helpers de update remoto ---
async function setQuantityRemote(pid, newQty) {
  const uid = currentUser?.id || currentUser?._id;
  // você tem setProductQuantity(req.params.uid, req.params.pid, req.params.pquantity)
  // Vou usar PUT /api/carts/quantity/:uid/:pid/:pquantity
  const url = `/api/carts/quantity/${encodeURIComponent(
    uid
  )}/${encodeURIComponent(pid)}/${encodeURIComponent(newQty)}`;
  const res = await fetch(url, { method: "PUT" });
  if (!res.ok) throw new Error(await res.text());
}

async function addOneRemote(pid) {
  const uid = currentUser?.id || currentUser?._id;
  // seu addProductToCart é POST /api/carts/:uid/:pid/:pquantity
  const url = `/api/carts/${encodeURIComponent(uid)}/${encodeURIComponent(
    pid
  )}/1`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
}

async function removeItemRemote(pid) {
  const uid = currentUser?.id || currentUser?._id;
  // suposição de rota (ajuste se necessário):
  // DELETE /api/carts/:uid/remove/:pid
  const url = `/api/carts/${encodeURIComponent(
    uid
  )}/remove/${encodeURIComponent(pid)}`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

async function clearCartRemote() {
  const uid = currentUser?.id || currentUser?._id;
  // você disse: api/carts/delete/userId
  // vou usar DELETE; se seu router for POST, troque o method.
  const url = `/api/carts/delete/${encodeURIComponent(uid)}`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

// --- Interações ---
document.addEventListener("click", async (e) => {
  const minusBtn = e.target.closest(".btn-minus");
  const plusBtn = e.target.closest(".btn-plus");
  const removeBtn = e.target.closest(".btn-remove");
  const clearBtn = e.target.closest("#clearCartBtn");
  const checkoutBtn = e.target.closest("#checkoutBtn");

  // Limpar carrinho
  if (clearBtn) {
    try {
      await clearCartRemote();
      items = [];
      render();
      showToast("success", "Carrinho limpo.");
    } catch (err) {
      showToast("danger", err.message || "Falha ao limpar carrinho.");
    }
    return;
  }

  // Finalizar compra (placeholder)
  if (checkoutBtn) {
    // aqui você chamaria sua rota de ordem/pagamento
    showToast("info", "Finalização de compra ainda não implementada.");
    return;
  }

  // Operações por item
  const row = e.target.closest("tr[data-pid]");
  if (!row) return;
  const pid = row.dataset.pid;
  const item = items.find((i) => i._id === pid);
  if (!item) return;

  // Remover item
  if (removeBtn) {
    try {
      await removeItemRemote(pid);
      items = items.filter((i) => i._id !== pid);
      render();
      showToast("success", "Item removido.");
    } catch (err) {
      showToast("danger", err.message || "Falha ao remover item.");
    }
    return;
  }

  // Diminuir
  if (minusBtn) {
    if (item.quantity <= 1) return;
    const newQty = item.quantity - 1;
    try {
      await setQuantityRemote(pid, newQty);
      item.quantity = newQty;
      // se seu setQuantity não mexe no estoque, mantemos o stock igual
      render();
    } catch (err) {
      showToast("danger", err.message || "Falha ao atualizar quantidade.");
    }
    return;
  }

  // Aumentar (respeitando stock)
  if (plusBtn) {
    if (item.quantity >= item.stock) {
      showToast("warning", "Quantidade máxima pelo estoque.");
      return;
    }
    try {
      // Podemos usar addOne (reserva +1 e já decrementa stock no banco, conforme sua regra)
      await addOneRemote(pid);
      item.quantity += 1;
      item.stock -= 1; // refletir a reserva no front
      render();
    } catch (err) {
      showToast("danger", err.message || "Falha ao adicionar unidade.");
    }
    return;
  }
});

// --- Live updates por socket (se emitir 'cartsUpdated' no back)
socket.on("cartsUpdated", async () => {
  try {
    await fetchCart();
    render();
  } catch (e) {
    // silencioso
  }
});

// --- Boot ---
(async function init() {
  try {
    await fetchCurrentUser();
    await fetchCart();
    render();
  } catch (err) {
    showToast("warning", "Faça login para ver o carrinho.");
    // opcional: window.location.href = "/login";
  }
})();
