var express = require("express");
const AuthController = require("../controllers/AuthController");

var router = express.Router();

router.get("/user", AuthController.user);
router.post("/register", AuthController.register);
router.post("/signupwithhomedata", AuthController.submitWithHomeData);
router.put("/submithomedata", AuthController.submitHomeData);
router.post("/login", AuthController.login);
router.post("/refreshToken", AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.post("/verify-otp", AuthController.verifyConfirm);
router.post("/resend-verify-otp", AuthController.resendConfirmOtp);

module.exports = router;