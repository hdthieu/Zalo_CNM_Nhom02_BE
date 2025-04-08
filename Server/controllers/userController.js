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

exports.sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const { email: toEmail, otp } = await userService.sendOtpToEmail(email);

  const message = `Mã OTP đặt lại mật khẩu của bạn là: ${otp}. Có hiệu lực trong 5 phút.`;

  await sendEmail({
    to: toEmail,
    subject: "OTP đặt lại mật khẩu",
    text: message,
  });

  res.json({ message: "Đã gửi OTP đến email của bạn" });
});
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    otpCode: otp,
    otpExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("OTP không hợp lệ hoặc đã hết hạn");
  }

  res.json({ message: "Xác thực OTP thành công" });
});
exports.resetPasswordForgot = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({
    email,
    otpCode: otp,
    otpExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("OTP không hợp lệ hoặc đã hết hạn");
  }

  user.password = newPassword;
  user.otpCode = undefined;
  user.otpExpire = undefined;

  await user.save();
  res.json({ message: "Đặt lại mật khẩu thành công" });
});


exports.resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: "Mật khẩu đã được cập nhật" });
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