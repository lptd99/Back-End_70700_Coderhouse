import { Router } from "express";
import usersController from "../controllers/users.controller.js";

const usersRouter = Router();

function auth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }
  next();
}

usersRouter.get("/", auth, usersController.getUsers);
usersRouter.get("/:email", auth, usersController.getUserByEmail);

usersRouter.post("/", auth, usersController.createUser);

usersRouter.put("/:email", auth, usersController.updateUser);

usersRouter.delete("/:email", auth, usersController.deleteUser);

export default usersRouter;
