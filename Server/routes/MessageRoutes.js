const express = require("express");
const router = express.Router();
const {
    sendMessage, getMessages, recallMessage, deleteMessageForMe
  } = require("../controllers/MessageController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, getMessages);
router.put("/recall/:messageId", protect, recallMessage);
router.put("/delete-for-me/:messageId", protect, deleteMessageForMe);

// routes/MessageRoutes.js

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const {
//     sendMessage, getMessages, deleteMessage, markSeen, revokeMessage, forwardMessage
// } = require("../controllers/MessageController");
// const { protect } = require("../middleware/authMiddleware");

// // Import multer và path
// const multer = require("multer");
// const path = require("path");

// // Cấu hình multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // Thư mục lưu trữ file
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên file duy nhất
//   },
// });

// const upload = multer({ storage }); // Khai báo biến upload

// // Định tuyến API gửi tin nhắn với file
// router.post("/", protect, upload.single("file"), sendMessage);

// // Các định tuyến khác
// router.get("/:chatId", protect, getMessages);
// router.delete("/:messageId", protect, deleteMessage);
// router.patch("/revoke/:messageId", protect, revokeMessage);
// router.patch("/seen/:messageId", protect, markSeen);
// router.post("/forward", protect, forwardMessage);

// module.exports = router;
