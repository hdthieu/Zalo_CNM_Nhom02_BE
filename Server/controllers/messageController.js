const asyncHandler = require("express-async-handler");
const messageService = require("../services/MessageService");

// exports.sendMessage = asyncHandler(async (req, res) => {
//   const { content, type = "text", chatId, fileUrl } = req.body;

//   if (!chatId) {
//     res.status(400);
//     throw new Error("chatId is required");
//   }

//   const message = await messageService.sendMessage({
//     sender: req.user._id,
//     content,
//     type,
//     chatId,
//     fileUrl,
//   });

//   res.status(201).json(message);
// });
const Message = require("../Models/Message");
const Chat = require("../Models/ChatModel");
exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: "Invalid data passed into request" });
  }

  const newMessage = new Message({
    sender: req.user._id,
    content: content,
    chat: chatId,
  });

  await newMessage.save();

  // Dùng findById để populate thay vì execPopulate
  let fullMessage = await Message.findById(newMessage._id)
    .populate("sender", "fullName email avatar")
    .populate({
      path: "chat",
      populate: {
        path: "users",
        select: "fullName email avatar",
      },
    });

  // Cập nhật latestMessage trong Chat
  await Chat.findByIdAndUpdate(chatId, { latestMessage: fullMessage });

  // Gửi socket đến người trong chat (nếu có)
  if (req.io) {
    req.io.to(chatId).emit("messageReceived", fullMessage);
    console.log("📤 Đã emit messageReceived đến room:", chatId);
  }

  res.status(201).json(fullMessage);
});


exports.getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const messages = await messageService.getAllMessages(chatId);
  res.status(200).json(messages);
});