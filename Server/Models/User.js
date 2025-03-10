const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["online", "offline"], default: "offline" }, 
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
