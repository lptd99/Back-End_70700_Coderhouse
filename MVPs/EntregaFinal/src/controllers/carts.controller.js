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
  const userId = req.params.uid;
  const productId = req.params.pid;
  let quantity = parseInt(req.params.pquantity, 10) || 1;

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Quantidade inválida." });
  }

  // 1) Decrementa estoque de forma atômica, só se houver estoque suficiente
  // (evita corrida: zwei usuários ao mesmo tempo – “dois usuários ao mesmo tempo”)
  const updatedProduct = await productModel.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true } // já retorna o produto com stock atualizado
  );

  if (!updatedProduct) {
    // Não encontrou produto OU não tinha estoque suficiente
    // Checa se o produto existe só pra melhorar a mensagem
    const exists = await productModel.exists({ _id: productId });
    return exists
      ? res
          .status(409)
          .json({ message: "Estoque insuficiente para este produto." })
      : res.status(404).json({ message: "Produto não encontrado." });
  }

  // 2) Atualiza o carrinho (adiciona ou incrementa)
  try {
    const cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      // rollback do estoque antes de sair
      await productModel.updateOne(
        { _id: productId },
        { $inc: { stock: quantity } }
      );
      return res.status(404).json({ message: "Carrinho não encontrado." });
    }

    const idx = cart.products.findIndex(
      (p) => p.product && p.product.toString() === productId.toString()
    );

    if (idx !== -1) {
      cart.products[idx].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();

    // sucesso ✅
    return res.status(200).json({
      message: "Produto adicionado ao carrinho.",
      productId,
      added: quantity,
      newStock: updatedProduct.stock,
    });
  } catch (err) {
    // 3) Se falhar o update do carrinho, desfaz a reserva no estoque (rollback)
    await productModel.updateOne(
      { _id: productId },
      { $inc: { stock: quantity } }
    );
    return res
      .status(500)
      .json({
        message: "Erro ao adicionar ao carrinho.",
        details: err.message,
      });
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
