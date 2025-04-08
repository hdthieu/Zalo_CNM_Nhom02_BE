const express = require("express");
const router = express.Router();
const friendRequestController = require("../controllers/FriendRequestController");

router.post("/addFriend", friendRequestController.sendFriendRequest);
router.post("/acceptFriend", friendRequestController.acceptFriendRequest);
// router.get("/searchFriend", authMiddleware, friendRequestController.searchFriendController);
module.exports = router;