const friendRequestService = require("../services/FriendRequestService");
const user = require("../Models/User");

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
  const result = await friendRequestService.acceptFriendRequest(
    senderId,
    receiverId
  );
  res.status(result.status).json({ message: result.message });
};

exports.searchFriendController = async (req, res) => {
  const userID = req.user.id;
  const query = req.query.id;

  const result = await friendRequestService.searchFriendRequest(userID, query);

  if (result.error)
    return res.status(result.status).json({ error: result.error });
  
  return res.status(result.status).json({ users: result.users });
};
