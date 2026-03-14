// backend/server.js  (no deployment code, only socket features added)
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { errorHandler, notFound } = require("./middleware/errorMidlleware");
const path = require("path");

const app = express();
dotenv.config();

connectDB();

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => res.send("API is running!"));
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
//  ------------------Deployement---------------

// middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running at ${PORT}`));

// ---------------- SOCKET.IO (added from old code) ----------------
const io = require("socket.io")(server, {
  pingTimeout: 600000,
  cors: {
    // Allow development from localhost, LAN IPs, and other dev URLs.
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

  // ✅ simple disconnect log (your old code used socket.off("setup") incorrectly)
  socket.on("disconnect", () => {
    console.log("🔌 USER DISCONNECTED:", socket.id);
  });
});
