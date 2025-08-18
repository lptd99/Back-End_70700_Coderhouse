import { cartModel } from "../dao/models/cart.model.js";
import { userModel } from "../dao/models/user.model.js";

const getUsers = async (req, res) => {
  let { limit, page, sort, query } = req.params;
  let users = [];

  users = await userModel.paginate(
    { query: query },
    { limit: limit || 10, page, sort }
  );

  if (users.docs.length > 0) {
    return res.status(200).json({ users: users.docs });
  } else {
    return res.status(404).json({ message: "Nenhum usuário encontrado." });
  }
};

const getUserByEmail = async (req, res) => {
  let email = req.params.email;
  try {
    let user = await userModel.findOne({ email: email });
    console.log(user);

    if (user) {
      return res.status(200).json({ user: user });
    } else {
      return res
        .status(404)
        .json({ message: `usuário de id ${id} não encontrado.` });
    }
  } catch (error) {
    return res.status(400).json({ message: "ID inválido." });
  }
};

const createUser = async (req, res) => {
  const io = req.app.get("io"); // recupera o io
  let user = req.body;

  if (
    !user.first_name ||
    !user.last_name ||
    !user.email ||
    !user.password ||
    !user.birth ||
    !user.role
  ) {
    return res.status(400).json({ message: "Usuário inválido." });
  }
  if (user.email) {
    const existingUser = await userModel.findOne({ email: user.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: `Usuário com email ${user.email} já existe.` });
    }
  }

  const result = await userModel.create(user);
  if (result) {
    io.emit("usersUpdated"); // emite para todos os clientes
    const cart = await cartModel.create({ user: result._id, products: [] });
    if (cart) {
      io.emit("cartsUpdated"); // emite para todos os clientes
      console.log("Carrinho criado com sucesso.");
    } else {
      console.log("Erro ao criar carrinho para usuário de email.");
    }
    return res.status(200).json({ message: "Usuário adicionado com sucesso." });
  } else {
    return res.status(400).json({ message: "Usuário inválido." });
  }
};

const updateUser = async (req, res) => {
  let email = req.params.email;
  let user = req.body;
  // const result = await productManager.updateProduct(id, product);
  const result = await userModel.findOneAndUpdate({ email: email }, user, {
    new: true,
  });
  if (result) {
    io.emit("usersUpdated"); // emite para todos os clientes
    return res.status(200).json({ message: "Usuário atualizado com sucesso." });
  } else {
    return res
      .status(404)
      .json({ message: `Usuário com email ${email} não encontrado.` });
  }
};

const deleteUser = async (req, res) => {
  const io = req.app.get("io"); // recupera o io
  let email = req.params.email;
  // const result = await productManager.deleteProduct(id); // ============== // Old, FileSystem usage
  const result = await userModel.findOneAndDelete({ email: email });
  if (result) {
    io.emit("usersUpdated"); // emite para todos os clientes
    const cart = await cartModel.findOneAndDelete({ user: result._id });
    if (cart) {
      io.emit("cartsUpdated"); // emite para todos os clientes
      console.log("Carrinho deletado com sucesso.");
    } else {
      console.log("Erro ao deletar carrinho para usuário de email.");
    }
    return res.status(200).json({ message: "Usuário deletado com sucesso." });
  } else {
    return res
      .status(404)
      .json({ message: `Usuário com email ${email} não encontrado.` });
  }
};

export default {
  getUsers,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
};
