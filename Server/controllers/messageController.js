const asyncHandler = require("express-async-handler");
const messageService = require("../services/MessageService");

const Message = require("../Models/Message");
const Chat = require("../Models/ChatModel");
exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, type, fileUrl } = req.body;

  if (!content && !fileUrl) {
    return res.status(400).json({ message: "Nội dung không được trống" });
  }

  const newMsg = await messageService.sendMessage({
    sender: req.user._id,
    content,
    chatId,
    type: type || "text",
    fileUrl,
  });

  // Emit socket
  if (req.io) {
    req.io.to(chatId).emit("messageReceived", newMsg);
    console.log("📤 Đã emit messageReceived đến room:", chatId);
  }

  res.status(201).json(newMsg);
});



exports.getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const messages = await messageService.getAllMessages(chatId);
  res.status(200).json(messages);
});

// exports.recallMessage = asyncHandler(async (req, res) => {
//   const { messageId } = req.params;

//   const recalledMsg = await messageService.recallMessage({
//     messageId,
//     userId: req.user._id,
//   });

//   // Nếu không có chat thì báo lỗi
//   if (!recalledMsg || !recalledMsg.chat) {
//     return res.status(400).json({ message: "Không tìm thấy cuộc trò chuyện để emit" });
//   }

//   // Emit đến room tương ứng
//   req.io.to(recalledMsg.chat._id.toString()).emit("messageRecalled", recalledMsg);

//   res.json({ message: "Đã thu hồi tin nhắn", data: recalledMsg });
// });

exports.recallMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id; // ID người dùng từ JWT

  // Gọi service để xử lý recall message
  const result = await messageService.recallMessage({ messageId, userId });

  // Kiểm tra kết quả trả về từ service
  if (result.error) {
    return res.status(result.statusCode).json({ message: result.error });
  }

  // Nếu thành công, trả về dữ liệu
  return res.json({ message: result.message, data: result.data });
});


// Xóa một phía
exports.deleteMessageForMe = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const deletedMsg = await messageService.deleteMessageForUser({
    messageId,
    userId: req.user._id,
  });

  res.json({ message: "Đã xóa tin nhắn khỏi tài khoản bạn", data: deletedMsg });
});

// exports.markSeen = asyncHandler(async (req, res) => {
//   const { messageId } = req.params;

//   const updated = await messageService.markAsSeen(messageId);
//   res.status(200).json(updated);
// });

// exports.forwardMessage = asyncHandler(async (req, res) => {
//   const { messageId, toChatId } = req.body;

//   const newMsg = await messageService.forwardMessage({
//     messageId,
//     toChatId,
//     sender: req.user._id,
//   });

//   if (req.io) req.io.to(toChatId).emit("messageReceived", newMsg);

//   res.status(201).json(newMsg);
// });

