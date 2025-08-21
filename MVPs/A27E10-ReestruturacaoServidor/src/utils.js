import bcrypt from "bcrypt";
import { dirname } from "path";
import { fileURLToPath } from "url";

export const authMW = (req, res, next) => {
  if (!req.session.user) {
    // TODO: separate admin / users
    return res.status(401).send("Unauthorized");
  }
  next();
};

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default __dirname;
