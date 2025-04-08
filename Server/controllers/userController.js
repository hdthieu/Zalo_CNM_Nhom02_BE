const userService = require("../services/UserService");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const User = require("../Models/User");
exports.registerUser = asyncHandler(async (req, res) => {
  try {
    const newUser = await userService.registerUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

exports.loginController = asyncHandler(async (req, res) => {
  try {
    const user = await userService.authUser(req.body);
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

exports.addNewUser = async (req, res) => {
  try {
    const user = req.body;
    const newUser = await userService.addUser(user);
    res.json({ user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("Người dùng không tồn tại");
  }

  // Tạo token và hash
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Lưu token vào DB
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 phút
  await user.save();

  const resetUrl = `http://localhost:3000/api/reset-password/${resetToken}`;
  const message = `Bạn đã yêu cầu đặt lại mật khẩu. Gửi POST tới:\n\n${resetUrl}\nvới body JSON chứa { "password": "mật khẩu mới" }`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Đặt lại mật khẩu",
      text: message,
    });

    res.json({ message: "Đã gửi email hướng dẫn đặt lại mật khẩu" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500);
    throw new Error("Không thể gửi email");
  }
});



exports.updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const result = await userService.updatePassword(req.user.id, oldPassword, newPassword);

  res.json(result);
});

exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user.id);
  res.json(user);
});

exports.updateUserProfile = asyncHandler(async (req, res) => {
  const updated = await userService.updateUserProfile(req.user.id, req.body);
  res.json(updated);
});




exports.checkUser = async (req, res) => {
  try {
    const { username } = req.params;
    const exists = await userService.checkUserExists(username);
    res.json({ exists });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.userId);
    res.json({ user });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};