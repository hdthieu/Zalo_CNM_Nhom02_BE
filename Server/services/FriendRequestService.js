const friendRequest = require("../Models/FriendRequest");
const userService = require("../services/UserService");

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


// tìm kiếm bạn bè
exports.searchFriendRequest = async (userId, query) => {
  try {
    const currentUser = await User.findById(userId).populate("friends"); 
    if (!currentUser) {
      return { error: "User not found", status: 404 };
    }

    const friendIds = currentUser.friends.map((friend) =>
      friend._id.toString()
    ); 

    let users = [];

    if (/^\d+$/.test(query)) {
      users = await User.find({
        _id: { $in: friendIds },
        phoneNumber: { $regex: query, $options: "i" },
      }).select("username phoneNumber avatar");

      // Nếu không có bạn bè nào trùng số điện thoại, tìm người lạ
      if (users.length === 0) {
        users = await User.find({
          phoneNumber: { $regex: query, $options: "i" },
          _id: { $ne: userId }, // Không hiển thị chính mình
        }).select("username phoneNumber avatar");
      }
    } else {
      // Nếu query là chữ (tìm theo tên)
      users = await User.find({
        _id: { $in: friendIds }, // Chỉ tìm trong danh sách bạn bè
        username: { $regex: query, $options: "i" },
      }).select("username phoneNumber avatar");
    }

    return { users, status: 200 };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
};