require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./Models/Message");
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
    methods: ["GET", "POST", "PUT", "DELETE"],
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
    if (!chat.users) return console.log("No users in chat");

    chat.users.forEach((user) => {
      const userId = user._id?.toString?.() || user.toString();
      if (userId === newMessage.sender._id?.toString()) return;
      io.to(chat._id).emit("messageReceived", newMessage);
    });

    console.log("Emitted message to room:", chat._id);
  });

  socket.on("recallMessage", async (messageId) => {
    const message = await Message.findById(messageId).populate("chat");

    if (!message || !message.chat) {
      console.error("Không tìm thấy tin nhắn hoặc cuộc trò chuyện");
      return;
    }

    io.to(message.chat._id.toString()).emit("messageRecalled", message);
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server is running on port 5000");
});


// =====================
// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");

// const connectDB = require("./config/db");
// const userRoute = require("./routes/userRoutes");
// const friendRoute = require("./routes/FriendRequestRoutes");
// const messageRoute = require("./routes/MessageRoutes");
// const chatModelRoutes = require("./routes/ChatModelRoutes");

// connectDB();

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*", 
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   },
// });

// app.use(cors());
// app.use(express.json());

// // APIs
// app.use("/users", userRoute);
// app.use("/friendRequests", friendRoute);
// app.use("/api/chat", chatModelRoutes);
// app.use("/api/message", messageRoute);

// // io.on("connection", (socket) => {
// //   console.log("User connected:", socket.id);

// //   socket.on("joinChat", (chatId) => {
// //     socket.join(chatId);
// //     console.log(`User ${socket.id} joined chat ${chatId}`);
// //   });

// //   socket.on("newMessage", (newMessage) => {
// //     const chat = newMessage.chat;
// //     if (!chat.users) return console.log("No users in chat");

// //     chat.users.forEach((user) => {
// //       const userId = user._id?.toString?.() || user.toString();
// //       if (userId === newMessage.sender._id?.toString()) return;

// //       // Phát tin nhắn đến room chat
// //       io.to(chat._id).emit("messageReceived", newMessage);
// //     });

// //     console.log("Emitted message to room:", chat._id);
// //   });
// // });
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("joinChat", (chatId) => {
//     socket.join(chatId);
//     console.log(`User ${socket.id} joined chat ${chatId}`);
//   });

//   socket.on("newMessage", (newMessage) => {
//     const chat = newMessage.chat;
//     if (!chat.users) return console.log("No users in chat");

//     chat.users.forEach((user) => {
//       const userId = user._id?.toString?.() || user.toString();
//       if (userId === newMessage.sender._id?.toString()) return;
//       io.to(chat._id).emit("messageReceived", newMessage);
//     });

//     console.log("Emitted message to room:", chat._id);
//   });

// socket.on("recallMessage", async (messageId) => {
//   const message = await Message.findById(messageId).populate("chat");

//   if (!message || !message.chat) {
//     console.error("Không tìm thấy tin nhắn hoặc cuộc trò chuyện");
//     return;
//   }

//   // Phát sự kiện messageRecalled với thông tin tin nhắn đầy đủ
//   io.to(message.chat._id.toString()).emit("messageRecalled", message);
// });

// });


  
// Truyền io vào req
// app.use((req, res, next) => {
//     req.io = io;
//     next();
//   });
  
  
// // Chạy server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  // ====================================



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
