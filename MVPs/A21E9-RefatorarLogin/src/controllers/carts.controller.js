import { cartModel } from "../dao/models/cart.model.js";
import { productModel } from "../dao/models/product.model.js";

const createCart = async (req, res) => {
  let userEmail = req.params.email;
  const cart = await cartModel.findOne({ email: userEmail });
  if (!cart) {
    return res
      .status(200)
      .json({ message: `Carrinho do user ${userId} já existe.` });
  } else {
    return res.status(200).json({ message: "Carrinho criado com sucesso." });
  }
};

const getProductsFromCart = async (req, res, next) => {
  const result = await cartModel.findOne({ user: req.params.uid });
  if (!result) {
    return res.status(404).json({ message: "Carrinho não encontrado." });
  }
  return res.status(200).json({ products: result.products });
};

const addProductToCart = async (req, res) => {
  let userId = req.params.uid;
  let productId = req.params.pid;
  let quantity = parseInt(req.params.pquantity) || 1;

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Quantidade inválida." });
  }

  let product = await productModel.findById(productId);
  console.log(product);

  if (!product) {
    return res
      .status(404)
      .json({ message: `Produto de id ${productCode} não encontrado.` });
  }

  let cart = await cartModel.findOne({ user: userId });
  console.log(cart);

  if (cart) {
    let productIndex = cart.products.findIndex(
      (p) => p.product && p.product.toString() === product._id.toString()
    );
    if (productIndex !== -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }
    await cart.save();
    return res.status(200).json({ message: "Produto adicionado ao carrinho." });
  } else {
    return res.status(404).json({ message: "Carrinho não encontrado." });
  }
};

const setProductQuantity = async (req, res) => {
  let userId = req.params.uid;
  let productId = req.params.pid;
  let quantity = parseInt(req.params.pquantity) || 1;

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Quantidade inválida." });
  }

  let cart = await cartModel.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ message: "Carrinho não encontrado." });
  }

  let productIndex = cart.products.findIndex(
    (p) => p.product && p.product.toString() === productId.toString()
  );
  if (productIndex !== -1) {
    cart.products[productIndex].quantity = quantity;
    await cart.save();
    return res
      .status(200)
      .json({ message: "Quantidade do produto atualizada." });
  } else {
    return res
      .status(404)
      .json({ message: "Produto não encontrado no carrinho." });
  }
};

const getCarts = async (req, res) => {
  const limit = req.query.limit || 0;
  let carts = [];

  if (limit && limit > 0) {
    let limitedCarts = await cartModel.find().limit(limit);
    carts = limitedCarts;
  } else {
    carts = await cartModel.find();
  }

  if (carts.length > 0) {
    return res.status(200).json({ carts: carts });
  } else {
    return res.status(404).json({ message: "Nenhum carrinho encontrado." });
  }
};

const clearCart = async (req, res) => {
  const cart = await cartModel.findOne({ user: req.params.uid });
  if (!cart) {
    return res.status(404).json({ message: "Carrinho não encontrado." });
  }
  cart.products = [];
  await cart.save();
  return res.status(200).json({ message: "Carrinho limpo com sucesso." });
};

export default {
  createCart,
  getProductsFromCart,
  addProductToCart,
  getCarts,
  clearCart,
  setProductQuantity,
};
