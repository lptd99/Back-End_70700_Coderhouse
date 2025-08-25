import { Router } from "express";
import passport from "passport";
import usersController from "../controllers/users.controller.js";
import { authMW, authorization, ensureNotLoggedIn } from "../utils.js";

const usersRouter = Router();

usersRouter.get("/", authMW, authorization("admin"), usersController.getUsers);

usersRouter.post(
  "/login",
  ensureNotLoggedIn,
  passport.authenticate("login", {
    failureRedirect: "/login?msg=Falha no Login, tente novamente",
  }),
  usersController.login
);

usersRouter.get("/faillogin", async (req, res) => {
  console.log("Failed to login:", req.body);
  res.status(400).send("Failed to login");
});

usersRouter.get(
  "/github",
  ensureNotLoggedIn,
  // não peça user:email -> a strategy NÃO chamará /user/emails
  passport.authenticate("github", { scope: ["read:user"] })
);

usersRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  usersController.githubLoginCB
);

usersRouter.get("/logout", usersController.logout);

usersRouter.post("/register", ensureNotLoggedIn, usersController.createUser);
usersRouter.get("/failregister", async (req, res) => {
  console.log("Failed to register user:", req.body);
  res.status(400).send("Failed to register");
});

usersRouter.post("/resetPassword", usersController.resetPassword);

usersRouter.get("/current", authMW, authorization("user"), (req, res) => {
  res.send(req.user || req.session.user);
});

usersRouter.get("/:email", authMW, usersController.getUserByEmail);
usersRouter.put("/:email", authMW, usersController.updateUser);
usersRouter.delete("/:email", authMW, usersController.deleteUser);

export default usersRouter;
