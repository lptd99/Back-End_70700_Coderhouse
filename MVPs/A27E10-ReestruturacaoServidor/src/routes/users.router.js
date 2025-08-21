import { Router } from "express";
import passport from "passport";
import usersController from "../controllers/users.controller.js";
import { authMW } from "../utils.js";

const usersRouter = Router();

usersRouter.get("/", authMW, usersController.getUsers);

usersRouter.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/faillogin" }),
  usersController.login
);
usersRouter.post("/faillogin", async (req, res) => {
  console.log("Failed to login:", req.body);
  res.status(400).send("Failed to login");
});

usersRouter.get("/logout", usersController.logout);

usersRouter.post(
  "/register",
  passport.authenticate("register", { failureRedirect: "/failregister" }),
  usersController.createUser
);
usersRouter.post("/failregister", async (req, res) => {
  console.log("Failed to register user:", req.body);
  res.status(400).send("Failed to register");
});

usersRouter.post("/resetPassword", usersController.resetPassword);

usersRouter.get("/:email", authMW, usersController.getUserByEmail);

usersRouter.put("/:email", authMW, usersController.updateUser);
usersRouter.delete("/:email", authMW, usersController.deleteUser);

export default usersRouter;
