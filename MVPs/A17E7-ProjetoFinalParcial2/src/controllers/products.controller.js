import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { productModel } from "../dao/models/product.model.js";
import ProductManager from "../dao/productManager.model.fs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const productManager = new ProductManager(
  path.join(__dirname, "../data/products.json")
);

const getProducts = async (req, res) => {
  let { limit } = req.query;
  let products = [];
  if (limit && limit > 0) {
    // let limitedProducts = await productManager.getProducts(limit); ============== // Old, FileSystem usage
    let limitedProducts = await productModel.find().limit(limit);
    products = limitedProducts;
  } else {
    // products = await productManager.getProducts(); ============== // Old, FileSystem usage
    products = await productModel.find();
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
  const io = req.app.get("io"); // recupera o io
  let product = req.body;

  if (
    !product.title ||
    !product.description ||
    !product.price ||
    !product.thumbnail ||
    !product.stock
  ) {
    return res.status(400).json({ message: "Produto inválido." });
  }
  if (product.price < 0 || product.stock < 0) {
    return res.status(400).json({ message: "Produto inválido." });
  }
  if (product.code) {
    const existingProduct = await productModel.findOne({ code: product.code });
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: `Produto de código ${product.code} já existe.` });
    }
  }

  // const result = productManager.addProduct(product); ============== // Old, FileSystem usage
  const result = await productModel.create(product);
  if (result) {
    io.emit("productsUpdated"); // emite para todos os clientes
    return res.status(200).json({ message: "Produto adicionado com sucesso." });
  } else {
    return res.status(400).json({ message: "Produto inválido." });
  }
};

const updateProduct = async (req, res) => {
  let id = parseInt(req.params.id);
  let product = req.body;
  // const result = await productManager.updateProduct(id, product);
  const result = await productModel.findByIdAndUpdate(id, product, {
    new: true,
  });
  if (result) {
    io.emit("productsUpdated"); // emite para todos os clientes
    return res.status(200).json({ message: "Produto atualizado com sucesso." });
  } else {
    return res
      .status(404)
      .json({ message: `Produto de id ${id} não encontrado.` });
  }
};

const deleteProduct = async (req, res) => {
  let id = parseInt(req.params.id);
  // const result = await productManager.deleteProduct(id); // ============== // Old, FileSystem usage
  const result = await productModel.findByIdAndDelete(id);
  if (result) {
    io.emit("productsUpdated"); // emite para todos os clientes
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
