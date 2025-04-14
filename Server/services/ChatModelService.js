const Chat = require("../Models/ChatModel");
const User = require("../Models/User");

exports.accessChatService = async (currentUser, userId) => {
  if (!userId) throw new Error("UserId is required");

  let chat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [currentUser._id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  if (chat) {
    await chat.populate("latestMessage.sender", "fullName email profilePic");
    return chat;
  }

  const newChat = await Chat.create({
    chatName: "sender",
    isGroupChat: false,
    users: [currentUser._id, userId],
  });

  return await newChat.populate("users", "-password");
};

exports.fetchChatsService = async (userId) => {
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: userId } },
  })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  return await User.populate(chats, {
    path: "latestMessage.sender",
    select: "fullName email profilePic",
  });
};

exports.createGroupChatService = async (users, name, creatorId) => {
  const groupChat = await Chat.create({
    chatName: name,
    users: [...users, creatorId],
    isGroupChat: true,
    groupAdmin: creatorId,
  });

  return await Chat.findById(groupChat._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
};

exports.renameGroupService = async (chatId, chatName, userId) => {
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!chat) throw new Error("Chat not found");
  if (chat.groupAdmin._id.toString() !== userId.toString())
    throw new Error("You are not the admin of this group");

  return chat;
};

exports.removeFromGroupService = async (chatId, userId) => {
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) throw new Error("Chat not found");
  return removed;
};

exports.addToGroupService = async (chatId, userId) => {
  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) throw new Error("Chat not found");
  return added;
};

exports.accessChatSend = async (currentUserId, targetUserId) => {
  let existingChat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [currentUserId, targetUserId] },
  }).populate("users", "-password");

  if (existingChat) return existingChat;

  const newChat = await Chat.create({
    chatName: "chat",
    isGroupChat: false,
    users: [currentUserId, targetUserId],
  });

  return await Chat.findById(newChat._id).populate("users", "-password");
};


