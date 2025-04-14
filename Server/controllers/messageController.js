const asyncHandler = require("express-async-handler");
const messageService = require("../services/MessageService");

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

exports.deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const deletedId = await messageService.deleteMessage(messageId, req.user._id);
  res.status(200).json({ deleted: deletedId });
});

exports.revokeMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const updated = await messageService.revokeMessage(messageId, req.user._id);

  if (req.io) req.io.to(updated.chat._id.toString()).emit("messageRevoked", updated);

  res.status(200).json(updated);
});

exports.markSeen = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const updated = await messageService.markAsSeen(messageId);
  res.status(200).json(updated);
});

exports.forwardMessage = asyncHandler(async (req, res) => {
  const { messageId, toChatId } = req.body;

  const newMsg = await messageService.forwardMessage({
    messageId,
    toChatId,
    sender: req.user._id,
  });

  if (req.io) req.io.to(toChatId).emit("messageReceived", newMsg);

  res.status(201).json(newMsg);
});

