const mongoose = require("mongoose");

const moment = require("moment-timezone");

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    createdAt: { type: Date, default: () => moment().tz("Asia/Ho_Chi_Minh").toDate() },
}, { timestamps: true });

GroupSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.createdAt = moment(ret.createdAt).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
        return ret;
    }
});

module.exports = mongoose.model("Group", GroupSchema);
