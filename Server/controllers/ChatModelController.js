const asyncHandler = require("express-async-handler");
const chatService = require("../services/ChatModelService");
const Chat = require("../Models/ChatModel");
//Hung sua 
const { upload, s3Client } = require("../config/s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");


exports.accessChat = asyncHandler(async (req, res) => {
  const chat = await chatService.accessChatSend(req.user._id, req.body.userId);
  res.status(chat._id ? 200 : 201).json(chat);
});

exports.fetchChats = asyncHandler(async (req, res) => {
  const chats = await chatService.fetchChatsService(req.user._id);
  res.status(200).json(chats);
});

exports.createGroupChat = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const { users: usersRaw, name } = req.body;

  if (!usersRaw || !name) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  const users = JSON.parse(usersRaw);
  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "At least 2 users are required to form a group chat" });
  }

  const groupChat = await chatService.createGroupChatService(
    users,
    name,
    req.user._id
  );
  [...users, req.user._id].forEach((userId) => {
    io.to(userId.toString()).emit("group:new", groupChat);
  });

  res.status(200).json(groupChat);
});

// DOi ten nhom
exports.renameGroup = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const { chatId, chatName } = req.body;
  const chat = await chatService.renameGroupService(
    chatId,
    chatName,
    req.user._id
  );
  chat.users.forEach((user) => {
    console.log("user._id", user._id);
    io.to(user._id.toString()).emit("group:updated", chat);
  });

  res.status(200).json(chat);
});

exports.removeFromGroup = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const { chatId, userId } = req.body;
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Không tìm thấy nhóm." });
  }
  const updatedChat = await chatService.removeFromGroupService(chatId, userId);
  io.to(userId.toString()).emit("group:removed", chatId);
  updatedChat.users.forEach((user) => {
    io.to(user._id.toString()).emit("group:updated", updatedChat);
  });

  res.status(200).json(updatedChat);
});


exports.addToGroup = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const { chatId, userId } = req.body;

  const updatedChat = await chatService.addToGroupService(chatId, userId);

  const addedUsers = Array.isArray(userId) ? userId : [userId];
  addedUsers.forEach((uid) => {
    io.to(uid.toString()).emit("group:new", updatedChat);
  });
  updatedChat.users.forEach((user) => {
    io.to(user._id.toString()).emit("group:updated", updatedChat);
  });

  res.status(200).json(updatedChat);
});

exports.dissGroupController = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const adminId = req.user._id;
  const { chatId } = req.params;
  try {
    const message = await chatService.dissolutionGroup(chatId, adminId);
    io.emit("group:deleted", { chatId });
    res.status(200).json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

exports.transferAdController = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const adminId = req.user._id;
  const { chatId } = req.params;
  const { newAdminId } = req.body;

  if (!chatId || !newAdminId) {
    return res
      .status(400)
      .json({ message: "Missing required parameters: chatId or newAdminId" });
  }

  console.log("Received Chat ID:", chatId);
  console.log("Received New Admin ID:", newAdminId);

  try {
    const updatedChat = await chatService.transferGroupAdmin(
      chatId,
      newAdminId,
      adminId
    );
    if (!updatedChat.users) {
      return res
        .status(400)
        .json({ message: "No users found in updated chat" });
    }

    updatedChat.users.forEach((user) => {
      io.to(user._id.toString()).emit("admin:transferred", {
        chatId: updatedChat._id,
        newAdminId,
      });
    });

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error transferring admin:", error.message);
    res.status(400).json({ message: error.message });
  }
});


// Danh Sach Thanh vien trong nhom
exports.getGroupUsersController = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;
    const users = await chatService.getGroupUsersService(chatId);
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Hung sua
exports.updateGroupAvatarController = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const { chatId } = req.body;
console.log("🔍 File upload:", req.file);

  if (!req.file || !req.file.location) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const updatedChat = await chatService.updateGroupAvatarService(
    chatId,
    req.user._id,
    req.file.location
  );

  updatedChat.users.forEach(user => {
    io.to(user._id.toString()).emit("group:updated", updatedChat);
  });

  res.status(200).json(updatedChat);
});

