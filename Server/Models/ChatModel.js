const mongoose = require("mongoose");

const ChatModel = new mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    //Hung sua
    groupAvatar: {
      type: String,
      default: "", // hoặc URL mặc định nếu có
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },

);

const Chat = mongoose.model("chatmodels", ChatModel);
module.exports = Chat;
