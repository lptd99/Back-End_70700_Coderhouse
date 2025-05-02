import { Router } from "express";
import cartsController from "../controllers/carts.controller.js";

const cartsRouter = Router();

cartsRouter.post("/", cartsController.createCart);

cartsRouter.get("/", cartsController.getCarts);

cartsRouter.get("/:id", cartsController.getProductsFromCart);

cartsRouter.post("/:cid/product/:pid", cartsController.addProductToCart);

export default cartsRouter;
