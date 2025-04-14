require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const userRoute = require("./routes/userRoutes");
const friendRoute = require("./routes/FriendRequestRoutes");
const messageRoute = require("./routes/MessageRoutes");
const chatModelRoutes = require("./routes/ChatModelRoutes");

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// APIs
app.use("/users", userRoute);
app.use("/friendRequests", friendRoute);
app.use("/api/chat", chatModelRoutes);
app.use("/api/message", messageRoute);

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });
  
    socket.on("newMessage", (newMessage) => {
        const chat = newMessage.chat;
      
        if (!chat.users) return console.log("❌ No users in chat");
      
        chat.users.forEach((user) => {
          const userId = user._id?.toString?.() || user.toString();
      
          if (userId === newMessage.sender._id?.toString()) return;
      
          // Gửi socket đến room
          io.to(chat._id).emit("messageReceived", newMessage);
        });
      
        console.log("📤 Emitted message to room:", chat._id);
      });
      
  });
  
  
// Truyền io vào req
app.use((req, res, next) => {
    req.io = io;
    next();
  });
  
  
// Chạy server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// // routes
// const connectDB = require("./config/db");
// const userRoute = require("./routes/userRoutes");
// const friendRoute = require("./routes/FriendRequestRoutes");
// const messageRoute = require("./routes/MessageRoutes");
// const chatModelRoutes = require("./routes/ChatModelRoutes");

// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // use Routes
// app.use("/users", userRoute);
// app.use("/friendRequests", friendRoute);
// // app.use("/messages", messageRoute);
// app.use("/api/chat", chatModelRoutes);
// app.use("/api/message", messageRoute);
// app.listen(5000, () => console.log("Server running on port 5000"));
