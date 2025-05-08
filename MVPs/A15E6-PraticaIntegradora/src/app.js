import dotenv from "dotenv";
import express from "express";
import handlebars from "express-handlebars";
import http from "http";
import path, { dirname } from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import apiRouter from "./routes/api.router.js";
import viewRouter from "./routes/view.router.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.engine("handlebars", handlebars.engine());

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
const io = new Server(server);
app.set("io", io); // isso aqui compartilha o io com os controllers

app.use("/", viewRouter);

const socketServer = new Server(server);
console.log("Socket server created");

let messages = [];

socketServer.on("connection", (socket) => {
  console.log("Connection established");
  socket.on("message", (message) => {
    console.log(`Message received. UserId: ${socket.id} | Text: ${message}`);
    const data = {
      socketId: socket.id,
      message: message,
    };
    messages.push(data);
    socket.on("getMessages", () => {
      socket.emit("messages", messages); // envia as mensagens atuais
    });
    socketServer.emit("message", messages);
    // socket.emit('message', messages); // manda só pro socket que originou a mensagem
    // socket.broadcast.emit('message', messages); // manda pra todos, menos pro socket que originou a mensagem
  });
  socket.on("disconnect", () => {
    console.log("Usuário desconectado");
  });
});

app.use("/api", apiRouter);
server.listen(8080, () => {
  console.log("Servidor rodando na porta 8080");
});

export default app;
