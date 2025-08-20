import { Router } from "express";
import { authMW } from "../utils.js";
import cartsRouter from "./carts.router.js";
import cookiesRouter from "./cookies.router.js";
import productsRouter from "./products.router.js";
import sessionRouter from "./session.router.js";
import usersRouter from "./users.router.js";

const router = Router();

// request logging middleware
router.use((req, res, next) => {
  if (req.body.password) {
    console.log("PASSWORD:", req.body.password);
  }

  console.log("REQUEST RECEIVED");
  console.log("ENDPOINT:", req.originalUrl);
  console.log("METHOD:", req.method);
  console.log("QUERY:", req.query);
  req.body.password ? null : console.log("BODY:", req.body);
  console.log("DATE AND TIME:", new Date().toString());
  console.log("//=======// //=======//");
  next();
});

// Use routes
router.use("/carts", authMW, cartsRouter);
router.use("/products", productsRouter);
router.use("/users", usersRouter);
router.use("/cookies", cookiesRouter);
router.use("/session", sessionRouter);

export default router;
