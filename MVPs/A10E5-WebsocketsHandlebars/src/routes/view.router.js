import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("home", { title: "Products" });
  console.log("Home route called");
});

router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { title: "Real Time Products" });
  console.log("Real Time Products route called");
});

export default router;
