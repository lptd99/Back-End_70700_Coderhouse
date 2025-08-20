import { Router } from "express";
import passport from "passport";

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

sessionRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).send("User not authenticated");
      }
      // User is authenticated, you can access user information here
      res.send(`Hello ${user.first_name}, you are logged in with GitHub!`);
    } catch (error) {
      res.status(500).send("Error while authenticating with GitHub");
    }
  }
);

sessionRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    // Successful authentication
    res.redirect("../../../");
  }
);

export default sessionRouter;
