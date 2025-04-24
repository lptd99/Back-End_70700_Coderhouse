import { Router } from "express";
import cartsRouter from "./carts.router.js";
import productsRouter from "./products.router.js";

const router = Router();

// request logging middleware
router.use((req, res, next) => {
  console.log("REQUEST RECEIVED");
  console.log("ENDPOINT:", req.originalUrl);
  console.log("METHOD:", req.method);
  console.log("QUERY:", req.query);
  console.log("BODY:", req.body);
  console.log("DATE AND TIME:", new Date().toString());
  console.log("//=======// //=======//");
  next();
});

// Use routes
router.use("/carts", cartsRouter);
router.use("/products", productsRouter);

export default router;
