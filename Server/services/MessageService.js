const Message = require("../Models/Message");
const Chat = require("../Models/ChatModel");

// exports.sendMessage = async ({ sender, content, type, chatId, fileUrl }) => {
//   // Kiểm tra tính hợp lệ của nội dung (nó có thể là văn bản, emoji, hoặc cả hai)
//   if (!content) {
//     return res.status(404).json({ message: "Message cannot be blank" });
//   }

//   // Tạo tin nhắn mới
//   const newMessage = await Message.create({
//     sender,
//     content,
//     type,
//     chat: chatId,
//     fileUrl,
//   });

//   // Cập nhật tin nhắn mới nhất trong chat
//   await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

//   // Trả về tin nhắn mới với thông tin người gửi và chat
//   return await Message.findById(newMessage._id)
//     .populate("sender", "fullName email avatar")
//     .populate("chat");
// };
exports.sendMessage = async ({ sender, content, type = "text", chatId, fileUrl }) => {
  const newMsg = await Message.create({
    sender,
    content,
    type,
    chat: chatId,
    fileUrl,
    deletedFor: [],
    recalled: false,
  });

  await Chat.findByIdAndUpdate(chatId, { latestMessage: newMsg._id });

  return await Message.findById(newMsg._id)
    .populate("sender", "fullName email avatar")
    .populate({
      path: "chat",
      populate: { path: "users", select: "fullName email avatar" },
    });
};

exports.getAllMessages = async (chatId) => {
  return await Message.find({ chat: chatId })
    .populate("sender", "fullName email avatar")
    .populate("chat");
};

// exports.recallMessage = async ({ messageId, userId }) => {
//   const message = await Message.findById(messageId).populate("chat");

//   if (!message) {
//     return res.status(404).json({ message: "Message not found" });
//   }

//   if (message.sender.toString() !== userId.toString()) {
//     return res.status(403).json({ message: "You are not authorized to recall this message" });
//   }

//   const createdAt = new Date(message.createdAt);
//   const now = new Date();
//   const sameDay =
//     createdAt.getFullYear() === now.getFullYear() &&
//     createdAt.getMonth() === now.getMonth() &&
//     createdAt.getDate() === now.getDate();

//   if (!sameDay) {
//     return res.status(403).json({ message: "You can only recall messages sent today" });
//   }

//   message.isRecalled = true;
//   message.recalledAt = new Date();
//   await message.save();

//   return message;
// };

exports.recallMessage = async ({ messageId, userId }) => {
  const message = await Message.findById(messageId).populate("chat");

  // Kiểm tra nếu không có tin nhắn
  if (!message) {
    return { error: "Message not found", statusCode: 404 };
  }

  // Kiểm tra quyền thu hồi tin nhắn
  if (message.sender.toString() !== userId.toString()) {
    return { error: "You are not authorized to recall this message", statusCode: 403 };
  }

  // Kiểm tra thu hồi tin nhắn trong ngày
  const createdAt = new Date(message.createdAt);
  const now = new Date();
  const sameDay =
    createdAt.getFullYear() === now.getFullYear() &&
    createdAt.getMonth() === now.getMonth() &&
    createdAt.getDate() === now.getDate();

  if (!sameDay) {
    return { error: "You can only recall messages sent today", statusCode: 403 };
  }

  // Kiểm tra nếu không có cuộc trò chuyện
  if (!message.chat) {
    return { error: "Chat not found", statusCode: 400 };
  }

  // Đánh dấu tin nhắn đã thu hồi
  message.isRecalled = true;
  message.recalledAt = new Date();
  await message.save();

  return { message: "Message recalled successfully", data: message };
};
exports.deleteMessageForUser = async({messageId, userId}) => {
  const message = await Message.findById(messageId);
  if(!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  if (!message.deletedFor.includes(userId)) {
    message.deletedFor.push(userId);
    await message.save();
  }

  return message;
}

exports.forwardMessage = async ({ messageId, toChatId, sender }) => {
  const original = await Message.findById(messageId);
  if (!original) throw new Error("Original message not found");

  const forwarded = await Message.create({
    sender,
    content: original.content,
    type: original.type,
    chat: toChatId,
    fileUrl: original.fileUrl,
  });

  await Chat.findByIdAndUpdate(toChatId, { latestMessage: forwarded._id });

  return await Message.findById(forwarded._id)
    .populate("sender", "fullName email avatar")
    .populate("chat");
};
