const asyncHandler = require("express-async-handler");
const chatService = require("../services/ChatModelService");

exports.accessChat = asyncHandler(async (req, res) => {
  const chat = await chatService.accessChatService(req.user, req.body.userId);
  res.status(chat._id ? 200 : 201).json(chat);
});

exports.fetchChats = asyncHandler(async (req, res) => {
  const chats = await chatService.fetchChatsService(req.user._id);
  res.status(200).json(chats);
});

exports.createGroupChat = asyncHandler(async (req, res) => {
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

  const groupChat = await chatService.createGroupChatService(users, name, req.user._id);
  res.status(200).json(groupChat);
});

exports.renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  const chat = await chatService.renameGroupService(chatId, chatName, req.user._id);
  res.status(200).json(chat);
});

exports.removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const updatedChat = await chatService.removeFromGroupService(chatId, userId);
  res.status(200).json(updatedChat);
});

exports.addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const updatedChat = await chatService.addToGroupService(chatId, userId);
  res.status(200).json(updatedChat);
});
