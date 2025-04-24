import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ProductManager from "../models/productManager.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const productManager = new ProductManager(
  path.join(__dirname, "../data/products.json")
);

const getProducts = async (req, res) => {
  let { limit } = req.query;
  let products = [];
  if (limit && limit > 0) {
    let limitedProducts = await productManager.getProducts(limit);
    products = limitedProducts;
  } else {
    products = await productManager.getProducts();
  }
  if (products.length > 0) {
    return res.status(200).json({ products: products });
  } else {
    return res.status(404).json({ message: "Nenhum produto encontrado." });
  }
};

const getProductById = async (req, res) => {
  let id = parseInt(req.params.id);
  let product = await productManager.getProductById(id);
  if (product) {
    return res.status(200).json({ product: product });
  } else {
    return res
      .status(404)
      .json({ message: `Produto de id ${id} não encontrado.` });
  }
};

const addProduct = async (req, res) => {
  let product = req.body;

  const result = await productManager.addProduct(product);
  if (result) {
    return res.status(200).json({ message: "Produto adicionado com sucesso." });
  } else {
    return res.status(400).json({ message: "Produto inválido." });
  }
};

const updateProduct = async (req, res) => {
  let id = parseInt(req.params.id);
  let product = req.body;
  const result = await productManager.updateProduct(id, product);
  if (result) {
    return res.status(200).json({ message: "Produto atualizado com sucesso." });
  } else {
    return res
      .status(404)
      .json({ message: `Produto de id ${id} não encontrado.` });
  }
};

const deleteProduct = async (req, res) => {
  let id = parseInt(req.params.id);
  const result = await productManager.deleteProduct(id);
  if (result) {
    return res.status(200).json({ message: "Produto deletado com sucesso." });
  } else {
    return res
      .status(404)
      .json({ message: `Produto de id ${id} não encontrado.` });
  }
};
export default {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
