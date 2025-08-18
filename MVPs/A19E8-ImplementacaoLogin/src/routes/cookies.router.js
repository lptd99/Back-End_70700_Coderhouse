import { Router } from "express";

const cookiesRouter = Router();

cookiesRouter.get("/setCookie", (req, res) => {
  res.cookie("userID", "cookieValue", { maxAge: 900000 });
  res.send("Cookie");
});

export default cookiesRouter;
