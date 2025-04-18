const friendRequest = require("../Models/FriendRequest");
const userService = require("../services/UserService");
const User = require("../Models/User");
exports.sendFriendRequest = async (senderId, receiverId) => {
  try {
    const sender = await userService.findById(senderId);
    const receiver = await userService.findById(receiverId);

    if (!sender || !receiver) {
      return { error: "User not found", status: 404 };
    }

    const existingRequest = await friendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingRequest) {
      await friendRequest.deleteOne({ _id: existingRequest._id });
      return { message: "Friend request cancelled", status: 200 };
    } else {
      const newRequest = new friendRequest({
        sender: senderId,
        receiver: receiverId,
      });
      await newRequest.save();
      return { message: "Friend request sent", status: 201 };
    }
  } catch (error) {
    return { error: error.message, status: 500 };
  }
};

exports.acceptFriendRequest = async (senderId, receiverId) => {
  try {
    const request = await friendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });
    if (!request) {
      return { error: "Friend request not found", status: 404 };
    }

    await userService.findByIdAndUpdate(senderId, {
      $push: { friends: receiverId },
    });
    await userService.findByIdAndUpdate(receiverId, {
      $push: { friends: senderId },
    });

    await friendRequest.deleteOne({ _id: request._id });
    return { message: "Friend request accepted", status: 200 };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
};


