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
const User = require("./Models/User");
const FriendRequest = require("./Models/FriendRequest");
const Notification = require("./Models/Notification");

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
app.set("io", io);
app.use(cors());
app.use(express.json());

// APIs
app.use("/users", userRoute);
app.use("/api/friendRequests", friendRoute);
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
    if (!chat?.users?.length) return console.log("No users in chat");

    io.to(chat._id.toString()).emit("messageReceived", newMessage);
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
  socket.on("messageEdited", (updatedMessage) => {
    if (!updatedMessage.chat || !updatedMessage.chat._id) {
      console.error("Chat ID is missing in the updated message.");
      return;
    }
    const chatId = updatedMessage.chat._id.toString();
    socket.to(chatId).emit("messageEdited", updatedMessage);
  });

  socket.on("setup", (userId) => {
    console.log("Setup event received for user:", userId);
    socket.userId = userId;
    socket.join(userId);
    console.log(`User ${userId} joined personal room`);
  });

  // socket.on("sendFriendRequest", async ({ senderId, receiverId }) => {
  //   try {
  //     const sender = await User.findById(senderId);
  //     const receiver = await User.findById(receiverId);

  //     if (!sender || !receiver) return;

  //     const existing = await FriendRequest.findOne({
  //       sender: senderId,
  //       receiver: receiverId,
  //     });

  //     if (existing) {
  //       console.log("Đã có lời mời rồi");
  //       return;
  //     }

  //     await FriendRequest.create({ sender: senderId, receiver: receiverId });

  //     io.to(receiverId).emit("friendRequestReceived", {
  //       sender: {
  //         _id: sender._id,
  //         fullName: sender.fullName,
  //         avatar: sender.avatar,
  //       },
  //     });

  //     await Notification.create({
  //       user: receiverId,
  //       type: "friend_request",
  //       message: `${sender.fullName} đã gửi lời mời kết bạn`,
  //     });

  //     console.log(`Friend request sent from ${senderId} to ${receiverId}`);
  //   } catch (error) {
  //     console.error("Error sending friend request:", error.message);
  //   }
  // });

// Hung sua 
socket.on("sendFriendRequest", async ({ senderId, receiverId }) => {
  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) return;

    const existing = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (!existing) {
      await FriendRequest.create({ sender: senderId, receiver: receiverId });
      console.log("✅ Friend request saved:", senderId, "->", receiverId);
    } else {
      console.log("⚠️ Friend request already exists, re-sending socket event");
    }

    // ✅ Luôn gửi socket event để người nhận thấy lời mời (kể cả nếu đã có trong DB)
    io.to(receiverId).emit("friendRequestReceived", {
      sender: {
        _id: sender._id,
        fullName: sender.fullName,
        avatar: sender.avatar,
      },
    });

    await Notification.create({
      user: receiverId,
      type: "friend_request",
      message: `${sender.fullName} đã gửi lời mời kết bạn`,
    });
  } catch (error) {
    console.error("❌ Error sending friend request:", error.message);
  }
});







  socket.on("createGroup", (newGroup) => {
    newGroup.users.forEach((userId) => {
      socket.to(userId).emit("newGroupCreated", newGroup);
    });
  });

  // Hung sua 
  // Test cuoc goi video call
  // Signaling cho WebRTC
  // ==============================
  // 🔁 WebRTC Signaling
  // ==============================

  socket.on("call-user", ({ offer, to, from }) => {
    io.to(to).emit("call-made", { offer, from });
  });

  socket.on("make-answer", ({ answer, to }) => {
    io.to(to).emit("answer-made", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { candidate });
  });

  socket.on("end-call", ({ to }) => {
    io.to(to).emit("call-ended");
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });

});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server is running on port 5000");
});




