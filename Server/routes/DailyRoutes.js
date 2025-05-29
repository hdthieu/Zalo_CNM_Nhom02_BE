const express = require("express");
const router = express.Router();
const DailyController = require("../controllers/DailyController");

router.post("/create-room", DailyController.createDailyRoom);

module.exports = router;
