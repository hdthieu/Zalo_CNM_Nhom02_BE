const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// fix timestamp
const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    email: { type: String, required: true, unique: true },
    avatar: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    status: { type: String, enum: ["online", "offline"], default: "offline" },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    otpCode: String,
    otpExpire: Date,
  },
  { timestamps: true }
);

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
