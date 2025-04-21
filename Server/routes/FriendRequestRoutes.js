const express = require("express");
const router = express.Router();
const friendRequestController = require("../controllers/FriendRequestController");
const { protect } = require("../middleware/authMiddleware");
router.post("/addFriend",protect, friendRequestController.sendFriendRequest);
router.post("/acceptFriend", protect, friendRequestController.acceptFriendRequest);
module.exports = router;