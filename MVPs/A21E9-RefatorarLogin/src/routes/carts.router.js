import { Router } from "express";
import cartsController from "../controllers/carts.controller.js";

const cartsRouter = Router();

function auth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }
  next();
}

cartsRouter.get("/", auth, cartsController.getCarts);

cartsRouter.get("/:uid", cartsController.getProductsFromCart);

cartsRouter.put(
  "/:uid/:pid/:pquantity",
  auth,
  cartsController.addProductToCart
);
cartsRouter.put(
  "/:uid/products/:pid/:pquantity",
  auth,
  cartsController.setProductQuantity
);

cartsRouter.delete("/:uid", auth, cartsController.clearCart);

export default cartsRouter;
