const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, recallMessage, deleteMessageForMe, editMessage } = require("../controllers/MessageController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../config/s3"); // multer-s3 middleware

// Cho phép gửi text + file (ảnh, tài liệu) trong 1 API
router.post("/", protect, upload.single("file"), sendMessage);
router.get("/:chatId", protect, getMessages);
router.put("/recall/:messageId", protect, recallMessage);
router.put("/delete-for-me/:messageId", protect, deleteMessageForMe);
router.put("/edit/:messageId", protect, editMessage);

module.exports = router;
