const express = require("express");
const {
  checkUser,
  getUser,
  getAllUsers,
  addNewUser,
  registerUser,
  loginController,
  forgotPassword,
  updatePassword
} = require("../controllers/UserController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/signup").post(registerUser);
router.post("/signin", loginController);

router.post("/addNewUser", addNewUser);
router.get("/getAllUser", getAllUsers);
router.get("/check/:username", checkUser);
router.get("/:userId", getUser);
router.post("/forgot-password", forgotPassword);
// router.get("/check/:username", checkUser);
router.put("/update-password", protect, updatePassword);

module.exports = router;
