const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup, getGroupUsersController,
  //Hung suasua
  updateGroupAvatarController,
  addToGroup, dissGroupController, transferAdController, getAvailableUsersForGroup
} = require("../controllers/ChatModelController");

const router = express.Router();
// Hung sua 
const { upload } = require("../config/s3"); // dùng đúng upload cấu hình AWS




router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/dissGroup/:chatId").delete(protect, dissGroupController);
router.route("/transferAdmin/:chatId").put(protect, transferAdController);
router.route("/users/:chatId").get(protect, getGroupUsersController);

// Hung sua 
router.route("/group/avatar").put(
  protect,
  upload.single("avatar"),
  updateGroupAvatarController
);

module.exports = router;
