import bcrypt from "bcrypt";
import passport from "passport";
import { dirname } from "path";
import { fileURLToPath } from "url";
passport;

export const ensureNotLoggedIn = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.status(409).send("Already logged in");
  }
  if (req.session?.user) {
    return res
      .status(409)
      .send(`User already logged in: ${req.session.user.email}`);
  }
  return next();
};

export const passportCall = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(401)
          .send({ error: info.messages ? info.messages : info.toString() });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    if (req.user.role !== role) {
      return res.status(403).send("No permissions");
    }
    next();
  };
};

export const authMW = (req, res, next) => {
  if (!req.session.user) {
    // TODO: separate admin / users
    return res.status(401).send("Unauthorized");
  }
  next();
};

export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default __dirname;
