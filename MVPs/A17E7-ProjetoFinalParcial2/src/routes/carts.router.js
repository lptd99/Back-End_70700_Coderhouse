import { Router } from "express";
import cartsController from "../controllers/carts.controller.js";

const cartsRouter = Router();

cartsRouter.get("/", cartsController.getCarts);

cartsRouter.get("/:uid", cartsController.getProductsFromCart);

cartsRouter.put("/:uid/:pid/:pquantity", cartsController.addProductToCart);
cartsRouter.put(
  "/:uid/products/:pid/:pquantity",
  cartsController.setProductQuantity
);

cartsRouter.delete("/:uid", cartsController.clearCart);

export default cartsRouter;
