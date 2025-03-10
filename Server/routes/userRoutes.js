const express = require("express");
const { checkUser, getUser, getAllUsers, addNewUser } = require("../controllers/UserController");

const router = express.Router();

router.post("/addNewUser", addNewUser);
router.get("/getAllUser", getAllUsers); 
router.get("/check/:username", checkUser); 
router.get("/:userId", getUser);
module.exports = router;
