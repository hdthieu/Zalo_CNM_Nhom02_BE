const express = require("express");
const router = express.Router();
const messageController = require("../controllers/MessageController");
const {authMiddleWare} = require("../middlewares/authMiddleware");

router.post("/send", authMiddleWare, messageController.sendMessage);

module.exports = router;