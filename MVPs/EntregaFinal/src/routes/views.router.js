import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("home", { title: "Products" });
  console.log("Home route called");
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
  console.log("Login route called");
});

export default router;
