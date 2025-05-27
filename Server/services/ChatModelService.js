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
  const chat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!chat) throw new Error("Chat not found");
  if (chat.groupAdmin._id.toString() !== userId.toString())
    throw new Error("You are not the admin of this group");

  chat.chatName = chatName;
  await chat.save();
  await chat.populate("users", "-password");
  await chat.populate("groupAdmin", "-password");

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
  const userIds = Array.isArray(userId) ? userId : [userId];

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { users: { $each: userIds } } },
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

exports.dissolutionGroup = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new Error("Chat not found");

  if (chat.groupAdmin.toString() !== userId.toString())
    throw new Error("You are not the admin of this group");

  await chat.deleteOne();
  return "Group chat deleted successfully";
};
exports.transferGroupAdmin = async (chatId, newAdminId, adminId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new Error("Chat not found");

  if (chat.groupAdmin.toString() !== adminId.toString())
    throw new Error("You are not the admin of this group");

  const isMember = chat.users.some(
    (userId) => userId.toString() === newAdminId.toString()
  );

  if (!isMember) throw new Error("New admin must be a member of the group");

  chat.groupAdmin = newAdminId;
  await chat.save();
  const updatedChat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  return updatedChat;
};

exports.getGroupUsersService = async (chatId) => {
  const chat = await Chat.findById(chatId).populate({
    path: "users",
    select: "fullName avatar",
  });

  if (!chat || !chat.isGroupChat) {
    throw new Error("Group chat not found");
  }

  return chat.users;
};

exports.updateGroupAvatarService = async (chatId, avatarUrl, userId) => {
  const chat = await Chat.findById(chatId);

  if (!chat) throw new Error("Nhóm không tồn tại");
  // if (chat.groupAdmin.toString() !== userId.toString()) {
  //   throw new Error("Bạn không phải admin nhóm");
  // }

  chat.avatar = avatarUrl;
  await chat.save();

  return await chat
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
};
