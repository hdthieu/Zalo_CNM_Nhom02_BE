const express = require("express");
const { checkUser, getUser, getAllUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/getAllUser", getAllUsers); 
router.get("/check/:username", checkUser); 
router.get("/:userId", getUser);

module.exports = router;
