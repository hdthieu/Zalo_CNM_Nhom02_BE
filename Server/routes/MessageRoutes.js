const express = require("express");
const router = express.Router();
const {
    sendMessage, getMessages
  } = require("../controllers/MessageController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, getMessages);
// routes/MessageRoutes.js

module.exports = router;
