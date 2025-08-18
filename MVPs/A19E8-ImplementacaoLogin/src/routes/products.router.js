import { Router } from "express";
import productsController from "../controllers/products.controller.js";

const productsRouter = Router();

function auth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }
  next();
}

productsRouter.get("/", productsController.getProducts);
productsRouter.get("/:id", productsController.getProductById);

productsRouter.post("/", auth, productsController.addProduct);

productsRouter.put("/:id", auth, productsController.updateProduct);

productsRouter.delete("/:id", auth, productsController.deleteProduct);

export default productsRouter;
