const User = require("../models/User");

exports.checkUserExists = async (username) => {
    const user = await User.findOne({ username });
    return !!user; // Trả về true nếu user tồn tại, false nếu không
};

exports.getUserById = async (userId) => {
    const user = await User.findById(userId).select("-password"); // Không trả về password
    if (!user) throw new Error("User not found");
    return user;
};

exports.getAllUsers = async () => {
    return await User.find().select("-password");
};

exports.addUser = async (user) => {
    return await User.create(user);
};

exports.upadateUser = async (userId, user) => {
    const updatedUser = await User.findByIdAndUpdate(userId, user, { new: true });}
    