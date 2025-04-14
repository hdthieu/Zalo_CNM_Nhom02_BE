const Message = require("../Models/Message");
const Chat = require("../Models/ChatModel");

exports.sendMessage = async ({sender, content, type, chatId, fileUrl}) => {
    const newMsg = await Message.create({
        sender,
        content,
        type,
        chat: chatId,
        fileUrl
    });

    await Chat.findByIdAndUpdate(chatId, {latestMessage: newMsg._id});

    return await Message.findById(newMsg._id).populate("sender", "fullName email profilePic").populate("chat");
}

exports.getAllMessages = async (chatId) => {
    return await Message.find({ chat: chatId })
      .populate("sender", "fullName email avatar")
      .populate("chat");
  };