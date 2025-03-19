const Message = require("../Models/Message");

const Notification = require("../Models/Notification");
const Group = require("../Models/Group");

exports.sendMessage = async (
  sender,
  receiver = null,
  content,
  messageType = "text",
  fileUrl = "",
  group = null
) => {
  try {
    if (!sender || (!receiver && !group) || !content) {
      return { error: "Missing required fields", status: 400 };
    }

    // Tạo object message dựa trên loại tin nhắn (cá nhân hoặc nhóm)
    const messageData = {
      sender,
      content,
      messageType,
      fileUrl,
    };

    if (receiver) {
      messageData.receiver = receiver;
    } else if (group) {
      messageData.group = group;
    }

    const newMessage = new Message(messageData);
    await newMessage.save();

    if (receiver) {
      // 🔹 Gửi thông báo cho người nhận trong tin nhắn cá nhân
      const notification = new Notification({
        user: receiver,
        type: "message",
        message: `Bạn có tin nhắn mới từ ${sender}`,
      });
      await notification.save();
    } else if (group) {
      // 🔹 Gửi thông báo cho tất cả thành viên nhóm 
      const groupData = await Group.findById(group);
      if (groupData) {
        const membersToNotify = groupData.members.filter(
          (member) => member.toString() !== sender.toString()
        );

        const notifications = membersToNotify.map((member) => ({
          user: member,
          type: "message",
          message: `Bạn có tin nhắn mới trong nhóm ${groupData.name}`,
        }));

        await Notification.insertMany(notifications);
      }
    }

    return { message: newMessage, status: 201 };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
};



exports.getMessages = async (userId, friendId) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    return { messages, status: 200 };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
};
