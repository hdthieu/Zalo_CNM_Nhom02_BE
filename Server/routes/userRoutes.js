const express = require("express");
const {
  checkUser,
  getUser,
  getAllUsers,
  addNewUser,
  registerUser,
  authUser,
} = require("../controllers/UserController");

const router = express.Router();

router.route("/signup").post(registerUser);
router.post("/signin", authUser);

router.post("/addNewUser", addNewUser);
router.get("/getAllUser", getAllUsers);
router.get("/check/:username", checkUser);
router.get("/:userId", getUser);
module.exports = router;
