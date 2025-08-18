import { Router } from "express";

const cookiesRouter = Router();

cookiesRouter.get("/setCookie", (req, res) => {
  res.cookie("userID", "cookieValue", { maxAge: 900000 });
  res.send("Cookie");
});

cookiesRouter.get("/setCookie/userID/:userID", (req, res) => {
  const { userID } = req.params;
  res.cookie("userID", userID, { maxAge: 900000, signed: true });
  res.send("Signed Cookie");
});

cookiesRouter.get("/getCookies", (req, res) => {
  const cookies = req.cookies;
  res.send(
    `Cookies retrieved: ${JSON.stringify(
      cookies
    )}\nSigned Cookies: ${JSON.stringify(req.signedCookies)}`
  );
});
cookiesRouter.get("/getCookie/userID", (req, res) => {
  const userID = req.signedCookies.userID;
  if (userID) {
    res.send(`Cookie userID retrieved: ${userID}`);
  } else {
    res.send("No cookie found");
  }
});

cookiesRouter.get("/deleteCookie", (req, res) => {
  res.clearCookie("userID").send("Cookie deleted");
});

export default cookiesRouter;
