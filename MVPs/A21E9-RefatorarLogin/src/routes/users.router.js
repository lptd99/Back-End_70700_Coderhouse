import { Router } from "express";
import usersController from "../controllers/users.controller.js";
import { authMW } from "../utils.js";

const usersRouter = Router();

usersRouter.get("/", authMW, usersController.getUsers);
usersRouter.get("/logout", usersController.logout);
usersRouter.post("/login", usersController.login);
usersRouter.post("/register", usersController.createUser);
usersRouter.post("/resetPassword", usersController.resetPassword);

usersRouter.get("/:email", authMW, usersController.getUserByEmail);

usersRouter.put("/:email", authMW, usersController.updateUser);

usersRouter.delete("/:email", authMW, usersController.deleteUser);

export default usersRouter;
