const mongoose = require("mongoose");

// fix timestamp
const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String},
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["online", "offline"], default: "offline" },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });


module.exports = mongoose.model("User", UserSchema);
