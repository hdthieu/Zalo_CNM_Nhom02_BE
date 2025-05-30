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
    // Hung sua
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "fullName email avatar"
      }
    }).sort({ updatedAt: -1 });
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
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .populate({
      path: "latestMessage.sender",
      select: "fullName email avatar",
    });

  if (!chat) throw new Error("Chat not found");

  // ✅ Cho phép bất kỳ thành viên nào đổi tên nhóm
  const isMember = chat.users.some((user) => user._id.toString() === userId.toString());
  if (!isMember) throw new Error("Bạn không phải thành viên của nhóm");

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
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .populate({
      path: "latestMessage.sender",
      select: "fullName email avatar",
    });

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
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .populate({
      path: "latestMessage.sender",
      select: "fullName email avatar",
    });

  if (!added) throw new Error("Chat not found");

  // ✅ Kiểm tra phần tử null
  added.users = (added.users || []).filter((u) => u && u._id);

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
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .populate({
      path: "latestMessage.sender",
      select: "fullName email avatar",
    });

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

// Hung sua 
// Hung sua
exports.updateGroupAvatarService = async (chatId, userId, avatarUrl) => {
  const chat = await Chat.findById(chatId);

  if (!chat) throw new Error("Group chat not found");

  // ❌ Bỏ kiểm tra admin
  // if (chat.groupAdmin.toString() !== userId.toString()) {
  //   throw new Error("Only admin can change group avatar");
  // }

  // ✅ Kiểm tra người dùng có trong nhóm không (bảo mật tối thiểu)
  const isMember = chat.users.some((u) => u.toString() === userId.toString());
  if (!isMember) {
    throw new Error("You must be a member to change group avatar");
  }

  chat.groupAvatar = avatarUrl;
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
     .populate("latestMessage")
    .populate({
      path: "latestMessage.sender",
      select: "fullName email avatar",
    });
  return updatedChat;
};

