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

const getProductsFromCart = async (req, res) => {
  const result = await cartModel.findOne({ user: req.params.uid });
  const products = result ? result.products : [];
  products.forEach(async (element) => {
    const p = await productModel.findById(element.product);
    if (!p) {
      console.log(
        `Produto com ID ${element.product} encontrado no Carrinho mas não no Banco: provavelmente deletado pelo vendedor. Removendo também do carrinho...`
      );
      await cartModel.updateOne(
        { user: req.params.uid },
        { $pull: { products: { product: element.product } } }
      );
    }
  });
  if (!result) {
    return res.status(404).json({ message: "Carrinho não encontrado." });
  }
  return res.status(200).json({ products: result.products });
};

const removeProductQuantityFromCart = async (req, res) => {
  const userId = req.params.uid;
  const productId = req.params.pid;
  let quantity = parseInt(req.params.pquantity, 10);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Quantidade inválida." });
  }

  const cart = await cartModel.findOne({ user: userId });

  if (!cart) {
    return res.status(404).json({ message: "Carrinho não encontrado." });
  }

  const product = await productModel.findById(productId);

  if (!product) {
    return res.status(404).json({ message: "Produto não encontrado." });
  }

  const idx = cart.products.findIndex(
    (p) => p.product && p.product.toString() === productId.toString()
  );

  if (idx === -1) {
    return res
      .status(404)
      .json({ message: "Produto não encontrado no carrinho." });
  }

  cart.products[idx].quantity -= quantity;
  await productModel.updateOne(
    { _id: productId },
    { $inc: { stock: quantity } }
  );

  let removed = false;
  if (cart.products[idx].quantity <= 0) {
    cart.products.splice(idx, 1);
    removed = true;
  }

  await cart.save();

  removed
    ? res
        .status(200)
        .json({ message: "Produto removido do carrinho.", productId })
    : res
        .status(200)
        .json({ message: "Quantidade do produto atualizada.", productId });
};

const addProductToCart = async (req, res) => {
  const userId = req.params.uid;
  const productId = req.params.pid;
  let quantity = parseInt(req.params.pquantity, 10);

  if (!Number.isFinite(quantity)) {
    return res.status(400).json({ message: "Quantidade inválida." });
  }

  const product = await productModel.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Produto não encontrado." });
  }

  if (quantity > product.stock) {
    res.setHeader("Content-Type", "application/json");
    return res.status(409).json({ message: "Estoque insuficiente." });
  }

  const updatedProduct = await productModel.findByIdAndUpdate(
    productId,
    { $inc: { stock: -quantity } },
    { new: true }
  );

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
    return res.status(500).json({
      message: "Erro ao adicionar ao carrinho.",
      details: err.message,
    });
  }
};

const removeProductFromCart = async (req, res) => {
  const userId = req.params.uid;
  const productId = req.params.pid;

  const cart = await cartModel.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ message: "Carrinho não encontrado." });
  }

  const idx = cart.products.findIndex(
    (p) => p.product && p.product.toString() === productId.toString()
  );

  if (idx === -1) {
    return res
      .status(404)
      .json({ message: "Produto não encontrado no carrinho." });
  }

  await productModel.updateOne(
    { _id: productId },
    { $inc: { stock: cart.products[idx].quantity } }
  );

  cart.products.splice(idx, 1);
  await cart.save();

  return res.status(200).json({ message: "Produto removido do carrinho." });
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
  for (const item of cart.products) {
    await productModel.updateOne(
      { _id: item.product },
      { $inc: { stock: item.quantity } }
    );
  }
  cart.products = [];
  await cart.save();
  return res.status(200).json({ message: "Carrinho limpo com sucesso." });
};

export default {
  createCart,
  getProductsFromCart,
  removeProductQuantityFromCart,
  removeProductFromCart,
  addProductToCart,
  getCarts,
  clearCart,
  setProductQuantity,
};
