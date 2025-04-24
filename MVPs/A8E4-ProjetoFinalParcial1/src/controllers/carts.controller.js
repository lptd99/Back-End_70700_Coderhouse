import path, { dirname } from "path";
import { fileURLToPath } from "url";
import CartManager from "../models/cartManager.model.js";
import ProductManager from "../models/productManager.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cartManager = new CartManager(path.join(__dirname, "../data/carts.json"));

// DÚVIDA TO-DO TODO TO DO DUVIDA PERGUNTA
// product manager vai mesmo aqui? outra opção/boa prática seria importar o product manager no router e passar como parâmetro para o cart manager?
const productManager = new ProductManager(
  path.join(__dirname, "../data/products.json")
);

const createCart = async (req, res) => {
  let userId = parseInt(req.params.id);
  const cart = await cartManager.createIfNoCart(userId);
  if (cart.products.length > 0) {
    return res
      .status(200)
      .json({ message: `Carrinho do user ${userId} já existe.` });
  } else {
    return res.status(200).json({ message: "Carrinho criado com sucesso." });
  }
};

const getProductsFromCart = async (req, res) => {
  let userId = parseInt(req.params.id);
  let cart = await cartManager.getCartById(userId);

  if (!cart) {
    createCart(req, res);
  } else {
    return res.status(200).json({ message: cart.getProducts() });
  }
};

const addProductToCart = async (req, res) => {
  let userId = parseInt(req.params.cid);
  let productId = parseInt(req.params.pid);
  let quantity = parseInt(req.body.quantity) || 1;

  let product = await productManager.getProductById(productId);

  if (!product) {
    return res
      .status(404)
      .json({ message: `Produto de id ${productId} não encontrado.` });
  }

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Quantidade inválida." });
  }

  let cart = await cartManager.getCartById(userId);
  if (cart) {
    cart.addProduct(productId, quantity);
    await cartManager.saveCarts();
    return res.status(200).json({ message: "Produto adicionado ao carrinho." });
  }
};

const getCartByUserId = async (req, res) => {
  let userId = parseInt(req.params.id);
  return await cartManager.getCartById(userId);
};

const getCarts = async (req, res) => {
  const limit = req.query.limit || 0;
  let carts = [];

  if (limit && limit > 0) {
    let limitedCarts = await cartManager.getCarts(limit);
    carts = limitedCarts;
  } else {
    carts = await cartManager.getCarts();
  }

  if (carts.length > 0) {
    return res.status(200).json({ message: carts });
  } else {
    return res.status(404).json({ message: "Nenhum carrinho encontrado." });
  }
};

export default {
  createCart,
  getProductsFromCart,
  addProductToCart,
  getCarts,
};
