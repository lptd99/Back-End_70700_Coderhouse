const express = require("express");
const ProductManager = require("./productManager.js");

const app = express();

let productManager = new ProductManager("./data/products.json");

app.use(express.urlencoded({ extended: true }));

app.get("/products", async (req, res) => {
  let { limit } = req.query;
  if (limit && limit > 0) {
    let limitedProducts = await productManager.getProducts(limit);
    return res.status(200).json({ message: limitedProducts });
  } else {
    let products = await productManager.getProducts();
    return res.status(200).json({ message: products });
  }
});

app.get("/products/:id", async (req, res) => {
  let id = parseInt(req.params.id);
  let product = await productManager.getProductById(id);
  if (product) {
    return res.status(200).json({ message: product });
  } else {
    return res
      .status(404)
      .json({ message: `Produto de id ${id} não encontrado.` });
  }
});

app.listen(8080, () => {
  console.log("Servidor rodando na porta 8080");
});
