import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import handlebars from "express-handlebars";
import session from "express-session";
import http from "http";
import mongoose from "mongoose";
import passport from "passport";
import path, { dirname } from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import initializePassport from "./config/passport.config.js";
import apiRouter from "./routes/api.router.js";
import viewRouter from "./routes/views.router.js";

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

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.ATLAS_DB_CONNECTION_STRING,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      collectionName: "sessions",
      ttl: 60 * 60, // 1h
    }),
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1h
      sameSite: "lax",
      // secure: true, // ative em produção HTTPS
    },
  })
);

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use((req, _res, next) => {
  console.log("Cookies recebidos:", req.cookies); // deve incluir authToken
  next();
});

app.use("/api", apiRouter);
server.listen(8080, () => {
  console.log("Servidor rodando na porta 8080");
});

const dbEnvironmentAsyncConnect = async () => {
  await mongoose
    .connect(process.env.ATLAS_DB_CONNECTION_STRING)
    .then(() => {
      console.log("Mongo conectado");
    })
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};

dbEnvironmentAsyncConnect();

export default app;
