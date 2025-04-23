import express from "express";
import apiRouter from "./routes/api.router.js";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.listen(8080, () => {
  console.log("Servidor rodando na porta 8080");
});

export default app;
