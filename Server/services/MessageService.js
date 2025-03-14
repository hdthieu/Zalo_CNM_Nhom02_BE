const Message = require("../Models/Message");

const message = require("../Models/Message");

exports.sendMessage = async (
  senderId,
  recieverId,
  content,
  messageType = "text",
  fileUrl = null
) => {
  try {
    const newMessage = new Message({
      sender: senderId,
      receiver: recieverId,
      content,
      messageType,
      fileUrl,
    });
    await newMessage.save();
    return { message: "Message sent", status: 201, data: newMessage };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
};
