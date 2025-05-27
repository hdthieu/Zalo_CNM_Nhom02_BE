const express = require("express");
const {
  checkUser,
  getUser,
  getAllUsers,
  addNewUser,
  registerUser,
  loginController, sendLoginOtp,
  resetPassword, findUsers, getListFriends, verifyLoginOtp, verifyRegisterOtp,
  updatePassword, getUserProfile , updateUserProfile, verifyOtp, sendOtp, resetPasswordForgot,
  removeFriendController
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const {upload} = require("../config/s3")

router.post("/signup", registerUser);
router.post("/verify-register-otp", verifyRegisterOtp);

router.post("/signin", loginController);
router.post("/signin-otp", sendLoginOtp);    
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/addNewUser", addNewUser);
router.get("/getAllUser", getAllUsers);
router.get("/check/:username", checkUser);
// router.get("/:userId", getUser);
// router.post("/forgot-password", forgotPassword);
router.get("/profile", protect, getUserProfile);
// router.get("/check/:username", checkUser);
router.put("/update-password", protect, updatePassword);
router.put("/updateprofile", protect, upload.single("avatar"), updateUserProfile);
// router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password-forgot", resetPasswordForgot);
router.route("/").get(protect, findUsers);
router.get("/listFriends", protect, getListFriends);

// Hung sua 
router.put("/removeFriend", protect, removeFriendController);



module.exports = router;
