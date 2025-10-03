const express = require("express");
const router = express.Router();
const passport = require("passport");

const mergeTemporaryCart = require("../utils/mergeTemporaryCart");
const transporter = require("../utils/emailServices");
const resetPasswordTemplate = require("../utils/resetPasswordTemplate");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/checkAuth");
const validateRegister = require("../middlewares/validateRegister");
const validateLogin = require("../middlewares/validateLogin");
const validateEmail = require("../middlewares/validateEmail");
const validatePassword = require("../middlewares/validatePassword");
const handleValidation = require("../middlewares/handleValidation");

const {
  registerUser,
  findUserByEmail,
  updatePassword,
} = require("../models/userModels");
const countryController = require("../controllers/country.controller.js");
const cartDatamapper = require("../datamappers/cart.datamapper");
const passwordResetTokenDatamapper = require("../datamappers/passwordResetToken.datamapper");

// Register route

router.get("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const countries = await countryController.getAllCountries();
    res.json({ countries });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading registration form");
  }
});

router.post(
  "/register",
  checkNotAuthenticated,
  validateRegister,
  handleValidation,
  async (req, res) => {
    try {
      const { email, password, first_name, last_name, phone_number } = req.body;

      const existingUser = await findUserByEmail(email);
      if (existingUser)
        return res.status(400).json({ error: "Email already registered" });

      const newUser = await registerUser({
        email,
        password,
        first_name,
        last_name,
        phone_number,
      });

      await cartDatamapper.createCart(newUser.id);

      return res.json({
        success: true,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Login route

router.post(
  "/login",
  checkNotAuthenticated,
  validateLogin,
  handleValidation,
  (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        return res
          .status(401)
          .json({ error: info.message || "Invalid credentials" });
      }

      req.logIn(user, async (err) => {
        if (err) return next(err);
        try {
          const temporaryCart = JSON.parse(req.body.temporaryCart || "[]");
          await mergeTemporaryCart(user.id, temporaryCart);
          return res.status(200).json({
            success: true,
            user: { id: user.id, email: user.email },
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: error.message });
        }
      });
    })(req, res, next);
  },
);

// Logout route

router.post("/logout", checkAuthenticated, function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.json({ success: true });
  });
});

// Google OAuth

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", async (err, user, info) => {
    if (err || !user) {
      return res.redirect(
        `${process.env.CLIENT_ORIGIN}/auth/login?status=error`,
      );
    }

    // Log the user in
    req.logIn(user, (err) => {
      if (err) {
        return res.redirect(
          `${process.env.CLIENT_ORIGIN}/auth/login?status=error`,
        );
      }

      const isNewUser = info?.isNewUser;

      const redirectURL = isNewUser
        ? `${process.env.CLIENT_ORIGIN}/?status=success&type=register`
        : `${process.env.CLIENT_ORIGIN}/?status=success&type=login`;

      return res.redirect(redirectURL);
    });
  })(req, res, next);
});

// Reset password routes

router.post(
  "/reset-password/request",
  validateEmail,
  handleValidation,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await findUserByEmail(email);
      if (!user)
        return res
          .status(404)
          .json({ message: "No user found with this email" });

      const resetToken = await passwordResetTokenDatamapper.createToken(user.id);
      if (!resetToken)
        return res
          .status(400)
          .json({ message: "Could not create a reset token" });

      const resetLink = `${process.env.CLIENT_ORIGIN}/reset-password?token=${resetToken}`;
      const html = resetPasswordTemplate(user.first_name, resetLink);

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        replyTo: process.env.GMAIL_USER,
        subject: "Password Reset Request",
        text: `
          Hi ${user.first_name},
          You requested to reset your password. Click the link below to proceed:
          ${resetLink}
          If you didn’t request this, you can ignore this email.
          This link will expire in 1 hour.
        `,
        html,
      });

      res
        .status(200)
        .json({ message: "Password reset link sent to your email" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error sending reset password email");
    }
  },
);

router.post(
  "/reset-password/confirm",
  validatePassword,
  handleValidation,
  async (req, res) => {
    try {
      const { token, password } = req.body;

      const resetToken = await passwordResetTokenDatamapper.getUserByToken(token);
      if (!resetToken)
        return res.status(400).json({ message: "Invalid or expired token" });

      await updatePassword(password, resetToken.userId);
      await passwordResetTokenDatamapper.deleteToken(token);

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating password");
    }
  }
);

module.exports = router;
