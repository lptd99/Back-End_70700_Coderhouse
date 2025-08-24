import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("home", { title: "Products" });
  console.log("Home route called");
});

router.get("/login", (req, res) => {
  res.render("login", { query: req.query, title: "Login" });
  console.log("Login route called");
});

router.get("/cart", (req, res) => {
  res.render("cart", { query: req.query, title: "Cart" });
  console.log("Cart route called");
});

router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
  console.log("Register route called");
});

export default router;
