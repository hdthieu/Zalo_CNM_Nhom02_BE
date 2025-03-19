const express = require("express");
const router = express.Router();
const messageController = require("../controllers/MessageController");

router.post("/send", messageController.sendMessage);
router.get("/:userId/:friendId", messageController.getMessages);    

module.exports = router;