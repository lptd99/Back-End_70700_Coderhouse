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

export default sessionRouter;
