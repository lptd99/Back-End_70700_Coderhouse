import { productModel } from "../dao/models/product.model.js";

const getProducts = async (req, res) => {
  let { limit, page, sort, query } = req.params;
  let products = [];

  products = await productModel.paginate(
    { query: query },
    { limit: limit || 10, page, sort }
  );

  if (products.docs.length > 0) {
    return res.status(200).json({ products: products.docs });
  } else {
    return res.status(404).json({ message: "Nenhum produto encontrado." });
  }
};

const getProductById = async (req, res) => {
  let id = req.params.id;
  console.log(`Buscando produto com código: ${id}`);

  try {
    let product = await productModel.findById(id);
    console.log(product);

    if (product) {
      return res.status(200).json({ product: product });
    } else {
      return res
        .status(404)
        .json({ message: `Produto de id ${id} não encontrado.` });
    }
  } catch (error) {
    return res.status(400).json({ message: "ID inválido." });
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
    !product.stock ||
    !product.code
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
