const asyncHandler = require("express-async-handler");
const messageService = require("../services/MessageService");
const {
  sendMessage: sendMessageService,
} = require("../services/MessageService");
const Message = require("../Models/Message");
const Chat = require("../Models/ChatModel");
const { Upload } = require("@aws-sdk/lib-storage");
const { s3Client } = require("../config/s3");

exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, type } = req.body;
  const file = req.file;

  if (!content && !file) {
    return res.status(400).json({ message: "Nội dung hoặc file phải có" });
  }

  let messageType = "text";
  if (file) {
    const fileType = file.mimetype;
    if (file) {
      const fileType = file.mimetype;

      if (fileType.startsWith("image/")) {
        messageType = "image";
      } else if (fileType.startsWith("video/")) {
        messageType = "video";
      } else if (fileType.startsWith("audio/")) {
        messageType = "audio";
      } else {
        messageType = "file";
      }
    }
  }

  const newMsg = await messageService.sendMessage({
    sender: req.user._id,
    chatId,
    content: content || "",
    type: messageType,
    fileUrl: file ? file.location : undefined,
    fileName: file?.originalname,
    fileType: file?.mimetype,
  });
  if (req.io) {
    req.io.to(chatId).emit("messageReceived", newMsg);
    console.log("Emit messageReceived:", chatId);
  }

  res.status(201).json(newMsg);
});


exports.getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const messages = await messageService.getAllMessages(chatId, userId);
  res.status(200).json(messages);
});

exports.recallMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;
  const result = await messageService.recallMessage({ messageId, userId });
  if (result.error) {
    return res.status(result.statusCode).json({ message: result.error });
  }
  return res.json({ message: result.message, data: result.data });
});

// Xoa tin nhan o phia nguoi gui (khong xoa o phia nguoi nhan) (chi trong ngay)
exports.deleteMessageForMe = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const result = await messageService.deleteMessageForUser({
    messageId,
    userId: req.user._id,
  });

  if (result.error) {
    return res.status(result.statusCode || 400).json({ message: result.error });
  }

  res.json({
    message: "Đã xóa tin nhắn khỏi tài khoản bạn",
    data: result.message,
  });
});

exports.editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content: newContent } = req.body;

  const result = await messageService.updateMessageContent({
    messageId,
    userId: req.user._id,
    newContent,
  });

  if (result.error) {
    return res.status(result.statusCode || 400).json({ message: result.error });
  }
  res.json(result.message);
});

exports.forwardMessage = asyncHandler(async (req, res) => {
  const { messageId, toChatId } = req.body;
  const sender = req.user._id;

  try {
    const forwardedMsg = await messageService.forwardMessage({
      messageId,
      toChatId,
      sender,
    });
    const io = req.app.get("io");
    io.to(toChatId).emit("messageReceived", forwardedMsg);
    console.log("Emitted forwarded message to room:", toChatId);

    res.status(201).json({
      success: true,
      message: "Forward thành công",
      data: forwardedMsg,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Có lỗi xảy ra",
    });
  }
});

// exports.uploadFileMessage = async (req, res) => {
//   try {
//     const { chatId } = req.body;
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ message: "Không có file để upload" });
//     }

//     const newMessage = await Message.create({
//       chatId,
//       sender: req.user.id,
//       fileUrl: file.location, // <- đây là URL do multer-s3 trả về
//       fileType: file.mimetype,
//       fileName: file.originalname,
//     });

//     res.status(200).json(newMessage);
//   } catch (err) {
//     console.error("Upload error", err);
//     res.status(500).json({ message: "Upload failed" });
//   }
// };

// exports.sendMessage = asyncHandler(async (req, res) => {
//   const { content, chatId, type, fileUrl } = req.body;

//   if (!content && !fileUrl) {
//     return res.status(400).json({ message: "Nội dung không được trống" });
//   }

//   const newMsg = await messageService.sendMessage({
//     sender: req.user._id,
//     content,
//     chatId,
//     type: type || "text",
//     fileUrl,
//   });

//   // Emit socket
//   if (req.io) {
//     req.io.to(chatId).emit("messageReceived", newMsg);
//     console.log("📤 Đã emit messageReceived đến room:", chatId);
//   }

//   res.status(201).json(newMsg);
// });



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

// exports.getMessages = asyncHandler(async (req, res) => {
//   const { chatId } = req.params;

//   const messages = await messageService.getAllMessages(chatId);
//   res.status(200).json(messages);
// });
// Xóa tin nhắn ở phía người nhận 
exports.deleteMessageForReceiver = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const result = await messageService.deleteMessageForUser({
    messageId,
    userId,
  });

  if (result.error) {
    return res.status(result.statusCode || 400).json({ message: result.error });
  }

  res.json({
    message: "Tin nhắn đã được ẩn khỏi phía bạn (người nhận)",
    data: result.message,
  });
});
