const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const crypto = require("crypto");
const generateToken = require("../config/generateToken");
const TempUser = require("../Models/TempUser");

exports.registerUser = async ({
  fullName,
  email,
  password,
  avatar,
  gender,
  phoneNumber,
  dateOfBirth,
}) => {
  if (!fullName) {
    throw new Error("Vui lòng nhập họ và tên");
  }

  if (!email) {
    throw new Error("Vui lòng nhập email");
  }

  if (!password) {
    throw new Error("Vui lòng nhập mật khẩu");
  }

  if (password.length < 8) {
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (!gender) {
    throw new Error("Vui lòng chọn giới tính");
  }

  if (!dateOfBirth) {
    throw new Error("Vui lòng nhập ngày sinh");
  }

  if (isNaN(Date.parse(dateOfBirth))) {
    throw new Error("Ngày sinh không hợp lệ");
  }

  const allowedGenders = ["male", "female"];
  if (!allowedGenders.includes(gender)) {
    throw new Error("Giới tính không hợp lệ");
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email đã tồn tại");
  }
  let tempUser = await TempUser.findOne({ email });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  if (tempUser) {
    tempUser.fullName = fullName;
    tempUser.password = password;
    tempUser.avatar = avatar;
    tempUser.gender = gender;
    tempUser.phoneNumber = phoneNumber;
    tempUser.dateOfBirth = dateOfBirth;
    tempUser.otpCode = otp;
    tempUser.otpExpire = Date.now() + 5 * 60 * 1000;
  } else {
    tempUser = new TempUser({
      fullName,
      email,
      password,
      avatar,
      gender,
      phoneNumber,
      dateOfBirth,
      otpCode: otp,
      otpExpire: Date.now() + 5 * 60 * 1000,
    });
  }
  await tempUser.save();

  return { email, otp };
};


exports.verifyRegisterOtp = async (email, otp) => {
  const tempUser = await TempUser.findOne({
    email,
    otpCode: otp,
    otpExpire: { $gt: Date.now() },
  });

  if (!tempUser) {
    throw new Error("OTP không hợp lệ hoặc đã hết hạn");
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email đã tồn tại");
  }
  const user = new User({
    fullName: tempUser.fullName,
    email: tempUser.email,
    password: tempUser.password,
    avatar: tempUser.avatar,
    gender: tempUser.gender,
    phoneNumber: tempUser.phoneNumber,
    dateOfBirth: tempUser.dateOfBirth,
  });

  await user.save();
  await TempUser.deleteOne({ email });
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id),
  };
};


// dang nhap user
// Đăng nhập với email + mật khẩu
exports.authUser = async ({ email, password }) => {
  if (!email) throw new Error("Vui lòng nhập email");
  if (!password) throw new Error("Vui lòng nhập mật khẩu");
  if (password.length < 8) throw new Error("Mật khẩu phải có ít nhất 8 ký tự");

  const user = await User.findOne({ email });
  if (!user) throw new Error("Email không tồn tại");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error("Sai mật khẩu");

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id),
  };
};

// Gửi OTP đăng nhập
exports.requestOtpLogin = async (email) => {
  if (!email) throw new Error("Vui lòng nhập email");

  const user = await User.findOne({ email });
  if (!user) throw new Error("Email không tồn tại");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otpCode = otp;
  user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 phút
  await user.save();

  return { email: user.email, otp };
};

// Xác minh OTP
exports.verifyLoginOtp = async (email, otp) => {
  if (!email) throw new Error("Vui lòng nhập email");
  if (!otp) throw new Error("Vui lòng nhập mã OTP");

  const user = await User.findOne({
    email,
    otpCode: otp,
    otpExpire: { $gt: Date.now() },
  });

  if (!user) throw new Error("OTP không hợp lệ hoặc đã hết hạn");

  user.otpCode = undefined;
  user.otpExpire = undefined;
  await user.save();

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id),
  };
};



exports.getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }
  return user;
};

exports.updateUserProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  user.fullName = data.fullName || user.fullName;
  // user.email = data.email || user.email;
  user.avatar = data.avatar || user.avatar;
  user.gender = data.gender || user.gender;
  user.dateOfBirth = data.dateOfBirth || user.dateOfBirth;
  user.phoneNumber = data.phoneNumber || user.phoneNumber;
  const updatedUser = await user.save();
  return {
    _id: updatedUser._id,
    fullName: updatedUser.fullName,
    // email: updatedUser.email,
    phoneNumber: updatedUser.phoneNumber,
    avatar: updatedUser.avatar,
    gender: updatedUser.gender,
    dateOfBirth: updatedUser.dateOfBirth,
  };
};

exports.updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }
  const isMatch = await user.matchPassword(oldPassword);
  if (!isMatch) {
    throw new Error("Mật khẩu cũ không chính xác");
  }
  user.password = newPassword;
  await user.save();
  return { message: "Đổi mật khẩu thành công" };
};

exports.sendOtpToEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email không tồn tại");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otpCode = otp;
  user.otpExpire = Date.now() + 5 * 60 * 1000; //5p
  await user.save();

  return { email: user.email, otp };
};

// danh sách bạn bè
exports.listFriends = async (userId) => {
  const user = await User.findById(userId).populate("friends");
  if (!user) return { message: "Người dùng không tồn tại" };
  if (user.friends.length === 0)
    return { message: "Người dùng không có bạn bè" };
  return user.friends.map((friend) => ({
    _id: friend._id,
    fullName: friend.fullName,
    avatar: friend.avatar,
    phoneNumber: friend.phoneNumber,
    status: friend.status,
    gender: friend.gender,
    dateOfBirth: friend.dateOfBirth,
  }));
};

exports.checkUserExists = async (fullName) => {
  const user = await User.findOne({ fullName });
  return !!user;
};

exports.getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

exports.getAllUsers = async () => {
  return await User.find().select("-password");
};

exports.findById = async (userId) => {
  return await User.findById(userId);
};

exports.findByIdAndUpdate = async (userId, user) => {
  return await User.findByIdAndUpdate(userId, user, { new: true });
};
