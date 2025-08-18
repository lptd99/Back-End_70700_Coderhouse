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
      const productToRender = `Code: ${product.code}
      Title: ${product.title}
      Description: ${product.description}
      Price: ${product.price}
      Stock: ${product.stock}
      Thumbnail: ${product.thumbnail}
      Category: ${product.category}
      Status: ${product.status}`;
      renderProduct(productToRender);
    });
    console.log("Produtos renderizados:", products);
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}

function renderProduct(product) {
  const li = document.createElement("li");
  li.textContent = product;
  productsList.appendChild(li);
}
