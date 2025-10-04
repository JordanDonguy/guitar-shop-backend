const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/checkAuth");
const validateRegister = require("../middlewares/validateRegister");
const validateLogin = require("../middlewares/validateLogin");
const validateEmail = require("../middlewares/validateEmail");
const validatePasswordAndToken = require("../middlewares/validatePasswordAndToken");
const handleValidation = require("../middlewares/handleValidation");

const authController = require("../controllers/auth.controller");

// Register
router.post(
  "/register",
  checkNotAuthenticated,
  validateRegister,
  handleValidation,
  authController.register,
);

// Login
router.post(
  "/login",
  checkNotAuthenticated,
  validateLogin,
  handleValidation,
  authController.login,
);

// Logout
router.post("/logout", checkAuthenticated, authController.logout);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get("/google/callback", authController.googleCallback);

// Reset password
router.post(
  "/reset-password/request",
  validateEmail,
  handleValidation,
  authController.requestPasswordReset,
);

router.post(
  "/reset-password/confirm",
  validatePasswordAndToken,
  handleValidation,
  authController.confirmPasswordReset,
);

module.exports = router;
