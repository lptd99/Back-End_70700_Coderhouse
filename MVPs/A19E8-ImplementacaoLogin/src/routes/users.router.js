import { Router } from "express";
import usersController from "../controllers/users.controller.js";

const usersRouter = Router();

usersRouter.get("/", usersController.getUsers);
usersRouter.get("/:email", usersController.getUserByEmail);

usersRouter.post("/", usersController.createUser);

usersRouter.put("/:email", usersController.updateUser);

usersRouter.delete("/:email", usersController.deleteUser);

export default usersRouter;
