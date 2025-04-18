const express = require("express");
const router = express.Router();
const friendRequestController = require("../controllers/FriendRequestController");
const { protect } = require("../middleware/authMiddleware");
router.post("/addFriend", friendRequestController.sendFriendRequest);
router.post("/acceptFriend", friendRequestController.acceptFriendRequest);
router.get("/searchFriend", protect, friendRequestController.searchFriendController);
module.exports = router;