const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Nếu chat 1-1
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // Nếu chat nhóm
    content: { type: String, required: true }, 
    messageType: { type: String, enum: ["text", "image", "file"], default: "text" },
    fileUrl: { type: String },
   
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],  // Array của những người đã xem tin nhắn
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
