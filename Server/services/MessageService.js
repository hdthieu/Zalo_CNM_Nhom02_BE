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
// exports.sendMessage = async ({ sender, content, type = "text", chatId, fileUrl }) => {
//   const newMsg = await Message.create({
//     sender,
//     content,
//     type,
//     chat: chatId,
//     fileUrl,
//     deletedFor: [],
//     recalled: false,
//   });

//   await Chat.findByIdAndUpdate(chatId, { latestMessage: newMsg._id });

//   return await Message.findById(newMsg._id)
//     .populate("sender", "fullName email avatar")
//     .populate({
//       path: "chat",
//       populate: { path: "users", select: "fullName email avatar" },
//     });
// };

exports.sendMessage = async ({ sender, content, chatId, type, fileUrl, fileName, fileType }) => {
  // Tạo tin nhắn mới
  const newMessage = await Message.create({
    sender,
    content,
    chat: chatId,
    type, // Kiểu của tin nhắn (text hoặc file)
    fileUrl, // Đường dẫn của file
    fileName, // Tên file
    fileType, // Kiểu file (ví dụ: image/png)
  });

  // Populate các thông tin liên quan đến chat và người gửi
  const fullMessage = await newMessage.populate([
    {
      path: "chat",
      populate: { path: "users", select: "fullName email avatar _id" },
    },
    { path: "sender", select: "fullName email avatar _id" },
  ]);

  return fullMessage;
};

// exports.getAllMessages = async (chatId) => {
//   return await Message.find({ chat: chatId })
//     .populate("sender", "fullName email avatar")
//     .populate("chat");
// };
exports.getAllMessages = async (chatId, userId) => {
  return await Message.find({
    chat: chatId,
    deletedFor: { $ne: userId }, 
  })
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
  if (!message) {
    return { error: "Message not found", statusCode: 404 };
  }
  if (message.sender.toString() !== userId.toString()) {
    return { error: "You are not authorized to recall this message", statusCode: 403 };
  }
  const createdAt = new Date(message.createdAt);
  const now = new Date();
  const sameDay =
    createdAt.getFullYear() === now.getFullYear() &&
    createdAt.getMonth() === now.getMonth() &&
    createdAt.getDate() === now.getDate();

  if (!sameDay) {
    return { error: "You can only recall messages sent today", statusCode: 403 };
  }
  if (!message.chat) {
    return { error: "Chat not found", statusCode: 400 };
  }
  message.isRecalled = true;
  message.recalledAt = new Date();
  await message.save();

  return { message: "Message recalled successfully", data: message };
};
// Xóa tin nhắn ở phía tôi (người gửi) (không xóa ở phía người nhận) (chỉ trong ngày)
exports.deleteMessageForUser = async ({ messageId, userId }) => {
  const message = await Message.findById(messageId);
  if (!message) {
    return { error: "Message not found", statusCode: 404 };
  }

  const msgDate = new Date(message.createdAt);
  const today = new Date();

  const isSameDay =
    msgDate.getDate() === today.getDate() &&
    msgDate.getMonth() === today.getMonth() &&
    msgDate.getFullYear() === today.getFullYear();

  if (!isSameDay) {
    return { error: "Chỉ được xóa tin nhắn trong ngày hôm nay", statusCode: 403 };
  }

  if (!message.deletedFor.includes(userId)) {
    message.deletedFor.push(userId);
    await message.save();
  }

  return { message };
};

exports.updateMessageContent = async ({ messageId, userId, newContent }) => {
  const message = await Message.findById(messageId);
  if (!message) {
    return { error: "Không tìm thấy tin nhắn", statusCode: 404 };
  }

  if (String(message.sender) !== String(userId)) {
    return { error: "Bạn không có quyền chỉnh sửa tin nhắn này", statusCode: 403 };
  }

  const createdAt = new Date(message.createdAt);
  const today = new Date();

  const isSameDay =
    createdAt.getDate() === today.getDate() &&
    createdAt.getMonth() === today.getMonth() &&
    createdAt.getFullYear() === today.getFullYear();

  if (!isSameDay) {
    return { error: "Chỉ có thể chỉnh sửa tin nhắn trong ngày hôm nay", statusCode: 403 };
  }

  message.content = newContent;
  message.isEdited = true;
  await message.save();

  const fullMessage = await Message.findById(message._id)
    .populate("chat") 
    .populate("sender", "fullName email avatar _id");

  return { message: fullMessage };
};




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
