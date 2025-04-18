const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, trim: true },
  type: { type: String, enum: ["text", "emoji", "image", "video", "file"], default: "text" },
  fileUrl: { type: String },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "chatmodels" },
  status: { type: String, enum: ["sent", "seen", "revoked"], default: "sent" },
  
  isRecalled: { type: Boolean, default: false },
  recalledAt: { type: Date },

  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

}, { timestamps: true });


const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
