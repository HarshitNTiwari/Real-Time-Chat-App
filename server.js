import path from "path"; //using path module of NodeJS
import { fileURLToPath } from "url";
import http from "http"; //using http module of NodeJS
import express, { json } from "express";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { formatMessage } from "./utils/messages.js";
import {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} from "./utils/users.js";
import { router as api } from "./auth/index.js";
import bodyParser from "body-parser";
import { isAuthenticated, isNotAlreadyloggedin } from "./middleware.js";

const app = express();
const httpserver = http.createServer(app);
const io = new Server(httpserver); // Server instance
dotenv.config();
const corsOptions = { credentials: true, origin: process.env.URL || "*" };

app.use(cors(corsOptions));
// app.use(json())
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//set static folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1", api);

// static routes
app.get("/login", isNotAlreadyloggedin, function (req, res) {
  res.sendFile(path.resolve("public/login.html"));
});

app.get("/create-chat", isAuthenticated, function (req, res) {
  try {
    res.sendFile(path.resolve("public/create-chat.html"));
  } catch (error) {
    console.error("Error sending file:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/chat", isAuthenticated, function (req, res) {
  res.sendFile(path.resolve("public/chat.html"));
});

// -------------------------------------------- Socket Communication -------------------------------------

// Runs whenever a client connects.  //listens for a connection.
io.on("connection", (socket) => {
  // the only event, the server instance `io` can emmit is 'connection. This event is fired upon a new connection.
  // The first argument is the socket instance `socket`

  // Listen for 'joinRoom' event from the client
  socket.on("joinRoom", ({ username, room }) => {
    // The `socket` here is a socket instance
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit("message", formatMessage("Bot", "Welcome to ChatApp!")); //Send to the user who has joined

    // Broadcasts when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("Bot", `${user.username} has joined the room!`)
      ); //broadcast to all the users except the one joining

    // Send user and room info when someone joins a room
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for 'chatMessage' event from the client
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    // Broadcast the message received from the client back to the client (to everybody)
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Runs when a user disconnects
  socket.on("disconnect", () => {
    //broadcast to all the users
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("Bot", `${user.username} has left the room!`)
      );

      // Send user and room info when someone leaves a room
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

httpserver.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
