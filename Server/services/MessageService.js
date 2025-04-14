const Message = require("../Models/Message");
const Chat = require("../Models/ChatModel");


exports.sendMessage = async ({ sender, content, type, chatId, fileUrl }) => {
  // Kiểm tra tính hợp lệ của nội dung (nó có thể là văn bản, emoji, hoặc cả hai)
  if (!content) {
    throw new Error("Nội dung tin nhắn không được để trống");
  }

  // Tạo tin nhắn mới
  const newMessage = await Message.create({
    sender,
    content,  // Đây có thể là văn bản hoặc emoji
    type,
    chat: chatId,
    fileUrl,
  });

  // Cập nhật tin nhắn mới nhất trong chat
  await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

  // Trả về tin nhắn mới với thông tin người gửi và chat
  return await Message.findById(newMessage._id)
    .populate("sender", "fullName email avatar")
    .populate("chat");
};

exports.getAllMessages = async (chatId) => {
    return await Message.find({ chat: chatId })
      .populate("sender", "fullName email avatar")
      .populate("chat");
  };


exports.deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);

  if (!message) throw new Error("Message not found");
  if (message.sender.toString() !== userId.toString()) {
    throw new Error("Not authorized to delete this message");
  }

  await message.remove();
  return messageId;
};


exports.revokeMessage = async (messageId, userId) => {
    const message = await Message.findById(messageId);
    if (!message) throw new Error("Message not found");
  
    if (message.sender.toString() !== userId.toString()) {
      throw new Error("You can only revoke your own message");
    }
  
    message.status = "revoked";
    message.content = "Tin nhắn đã được thu hồi";
    await message.save();
  
    return await Message.findById(messageId)
      .populate("sender", "fullName email avatar")
      .populate("chat");
  };
  
exports.markAsSeen = async (messageId) => {
    return await Message.findByIdAndUpdate(messageId, { status: "seen" }, { new: true });
  };
  
exports.forwardMessage = async ({ messageId, toChatId, sender }) => {
    const original = await Message.findById(messageId);
    if (!original) throw new Error("Original message not found");
  
    const forwarded = await Message.create({
      sender,
      content: original.content,
      type: original.type,
      chat: toChatId,
      fileUrl: original.fileUrl
    });
  
    await Chat.findByIdAndUpdate(toChatId, { latestMessage: forwarded._id });
  
    return await Message.findById(forwarded._id)
      .populate("sender", "fullName email avatar")
      .populate("chat");
  };
  