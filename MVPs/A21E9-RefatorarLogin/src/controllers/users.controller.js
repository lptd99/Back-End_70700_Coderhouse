import { cartModel } from "../dao/models/cart.model.js";
import { userModel } from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";

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
  let user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password.trim()
      ? createHash(req.body.password)
      : undefined,
    birth: req.body.birth,
    role: "user",
  };

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

const login = async (req, res) => {
  if (req.session.user) {
    return res.send(`User already logged in: ${req.session.user.email}`);
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.send("Email and password are required");
  }

  const user = await userModel.findOne({ email });
  if (!isValidPassword(user, password)) {
    return res.send("Invalid email or password");
  }
  req.session.user = user;

  if (user.role === "admin") {
    req.session.admin = true;
    res.send("Admin user authenticated");
  } else {
    res.send("User authenticated");
  }
  // TODO: Redirect to Products (current: can't POST to /products)
  // Change above res.send to log
  // res.redirect("../../products");
};

const logout = async (req, res) => {
  if (!req.session.user) {
    return res.send("No user logged in");
  }

  req.session.destroy((err) => {
    if (err) {
      return res.send("Error logging out");
    }
    res.send("Logged out successfully");
  });
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and new password are required." });
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.password = createHash(password);
  await user.save();

  res.status(200).json({ message: "Password reset successfully." });
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
  login,
  logout,
  resetPassword,
  updateUser,
  deleteUser,
};
