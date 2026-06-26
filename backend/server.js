const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { errorHandler, notFound } = require("./middleware/errorMidlleware");

const app = express();
dotenv.config();

let dbPromise = null;
const ensureDb = async (req, res, next) => {
  if (!dbPromise) dbPromise = connectDB();
  try {
    await dbPromise;
    next();
  } catch (error) {
    next(error);
  }
};

app.use(ensureDb);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("API is running!"));
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => console.log(`Server running at ${PORT}`));

  const io = require("socket.io")(server, {
    path: process.env.SOCKET_PATH || "/socket.io",
    pingTimeout: 600000,
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Connected to socket.io:", socket.id);

    socket.on("setup", (userData) => {
      if (!userData?._id) return;

      socket.join(userData._id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      if (!room) return;
      socket.join(room);
      console.log("User Joined Room:", room);
    });

    socket.on("typing", (payload) => {
      const room = payload?.room;
      if (!room) return;
      socket.in(room).emit("typing", payload);
    });

    socket.on("stop typing", (payload) => {
      const room = payload?.room;
      if (!room) return;
      socket.in(room).emit("stop typing", payload);
    });

    socket.on("new message", (newMessageRecieved) => {
      const chat = newMessageRecieved?.chat;

      if (!chat?.users) return console.log("chat.users not defined");

      chat.users.forEach((u) => {
        if (u._id == newMessageRecieved?.sender?._id) return;
        socket.in(u._id).emit("message recieved", newMessageRecieved);
      });
    });

    socket.on("disconnect", () => {
      console.log("🔌 USER DISCONNECTED:", socket.id);
    });
  });
}
