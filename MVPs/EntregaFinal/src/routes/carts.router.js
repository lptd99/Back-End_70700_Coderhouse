import { Router } from "express";
import cartsController from "../controllers/carts.controller.js";

const cartsRouter = Router();

cartsRouter.get("/", cartsController.getCarts);

cartsRouter.get("/:uid", cartsController.getProductsFromCart);

cartsRouter.post("/:uid/:pid/:pquantity", cartsController.addProductToCart);
cartsRouter.post(
  "/:uid/:pid/remove/:pquantity",
  cartsController.removeProductQuantityFromCart
);
cartsRouter.post(
  "/:uid/products/:pid/:pquantity",
  cartsController.setProductQuantity
);

cartsRouter.delete("/:uid", cartsController.clearCart);
cartsRouter.delete("/:uid/:pid", cartsController.removeProductFromCart);

export default cartsRouter;
