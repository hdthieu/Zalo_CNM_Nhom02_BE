const express = require("express");
const {
  checkUser,
  getUser,
  getAllUsers,
  addNewUser,
  registerUser,
  loginController,
  resetPassword, findUsers, getListFriends,
  updatePassword, getUserProfile , updateUserProfile, verifyOtp, sendOtp, resetPasswordForgot
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/signup").post(registerUser);
router.post("/signin", loginController);

router.post("/addNewUser", addNewUser);
router.get("/getAllUser", getAllUsers);
router.get("/check/:username", checkUser);
// router.get("/:userId", getUser);
// router.post("/forgot-password", forgotPassword);
router.get("/profile", protect, getUserProfile);
// router.get("/check/:username", checkUser);
router.put("/update-password", protect, updatePassword);
router.put("/updateprofile", protect, updateUserProfile);
// router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password-forgot", resetPasswordForgot);
router.route("/").get(protect, findUsers);
router.get("/listFriends", protect, getListFriends);
module.exports = router;
