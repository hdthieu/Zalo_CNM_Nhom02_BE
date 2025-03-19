const express = require("express");
const router = express.Router();
const groupController = require("../controllers/GroupController");

router.post("/create", groupController.createGroup);

module.exports = router;
