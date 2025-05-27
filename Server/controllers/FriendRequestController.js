const friendRequestService = require("../services/FriendRequestService");
const user = require("../Models/User");
// Hung sua 
const FriendRequest = require("../Models/FriendRequest");

exports.sendFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;
  const result = await friendRequestService.sendFriendRequest(
    senderId,
    receiverId
  );
  res.status(result.status).json({ message: result.message });
};

exports.acceptFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;
  const io = req.app.get("io");

  const result = await friendRequestService.acceptFriendRequest(
    senderId,
    receiverId,
    io 
  );

  res.status(result.status).json({ message: result.message });
};

//Hung sua 
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await FriendRequest.find({ receiver: userId })
      .populate("sender", "fullName avatar email");

    res.json(requests.map((req) => req.sender)); 
  } catch (err) {
    console.error("Lỗi lấy lời mời:", err);
    res.status(500).json({ error: "Server error khi lấy lời mời kết bạn" });
  }
};

