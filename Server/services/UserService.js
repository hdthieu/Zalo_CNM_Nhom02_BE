const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const generateToken = require("../config/generateToken");

// dang ky user

exports.registerUser = async ({ fullName, email, password, avatar }) => {
  if (!fullName || !email || !password) {
    throw new Error("Please fill all the fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("Email already exists");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const user = await User.create({ fullName, email, password, avatar });
  if (!user) {
    throw new Error("Invalid user data");
  }

  return {
    _id: user._id,
    fullName: user.fullName,
    password: user.password,
    phoneNumber: user.phoneNumber,
    email: user.email,
    avatar: user.avatar,
    status: user.status,
    friends: user.friends,
    token: generateToken(user._id),
  };
};
// dang nhap user
exports.authUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Please fill all the fields");
  }

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    };
  } else {
    throw new Error("Invalid email or password");
  }
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
