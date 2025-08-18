import { Router } from "express";

const sessionRouter = Router();

sessionRouter.get("/", (req, res) => {
  if (req.session.counter) {
    req.session.counter++;
    res.send(`Session counter: ${req.session.counter}`);
  } else {
    req.session.counter = 1;
    res.send(`Session counter initialized: ${req.session.counter}`);
  }
});

sessionRouter.get("/login", (req, res) => {
  const { username, password } = req.query;
  if (username !== "admin" || password !== "admin") {
    return res.send("Invalid credentials");
  }
  if (req.session.user) {
    return res.send(`User already logged in: ${req.session.user}`);
  }
  req.session.user = username;
  req.session.admin = true;
  console.log("Admin user authenticated");
  res.redirect("../products");
});

sessionRouter.get("/logout", (req, res) => {
  if (!req.session.user) {
    return res.send("No user logged in");
  }
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error logging out");
    }
    res.send("Logged out successfully");
  });
});

export default sessionRouter;
