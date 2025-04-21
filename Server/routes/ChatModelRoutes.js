const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup, getGroupUsersController,
  addToGroup, dissGroupController, transferAdController
} = require("../controllers/ChatModelController");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/dissGroup/:chatId").delete(protect, dissGroupController);
router.route("/transferAdmin/:chatId").put(protect, transferAdController);
router.route("/users/:chatId").get(protect, getGroupUsersController);

module.exports = router;
