const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Group", GroupSchema);
