const passport = require("passport");
const transporter = require("../utils/emailServices");
const resetPasswordTemplate = require("../utils/resetPasswordTemplate");
const mergeTemporaryCart = require("../utils/mergeTemporaryCart");
const userDatamapper = require("../datamappers/user.datamapper");
const cartDatamapper = require("../datamappers/cart.datamapper");
const passwordResetTokenDatamapper = require("../datamappers/passwordResetToken.datamapper");

const authController = {
  async register(req, res) {
    try {
      const { email, password, first_name, last_name, phone_number } = req.body;
      const existingUser = await userDatamapper.findByEmail(email);
      if (existingUser) return res.status(400).json({ error: "Email already registered" });

      const newUser = await userDatamapper.register({
        email,
        password,
        first_name,
        last_name,
        phone_number,
      });

      await cartDatamapper.createCart(newUser.id);

      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  login(req, res, next) {
    passport.authenticate("local", async (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info.message || "Invalid credentials" });
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

  logout(req, res, next) {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  },

  googleCallback(req, res, next) {
    passport.authenticate("google", (err, user, info) => {
      if (err || !user) {
        return res.redirect(`${process.env.CLIENT_ORIGIN}/auth/login?status=error`);
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.redirect(`${process.env.CLIENT_ORIGIN}/auth/login?status=error`);
        }

        const isNewUser = info?.isNewUser;
        const redirectURL = isNewUser
          ? `${process.env.CLIENT_ORIGIN}/?status=success&type=register`
          : `${process.env.CLIENT_ORIGIN}/?status=success&type=login`;

        return res.redirect(redirectURL);
      });
    })(req, res, next);
  },

  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const user = await userDatamapper.findByEmail(email);
      if (!user) return res.status(404).json({ message: "No user found with this email" });

      const resetToken = await passwordResetTokenDatamapper.createToken(user.id);
      if (!resetToken) return res.status(400).json({ message: "Could not create a reset token" });

      const resetLink = `${process.env.CLIENT_ORIGIN}/reset-password?token=${resetToken}`;
      const html = resetPasswordTemplate(user.firstName, resetLink);

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        replyTo: process.env.GMAIL_USER,
        subject: "Password Reset Request",
        text: `
          Hi ${user.firstName},
          You requested to reset your password. Click the link below to proceed:
          ${resetLink}
          If you didn’t request this, you can ignore this email.
          This link will expire in 1 hour.
        `,
        html,
      });

      res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error sending reset password email");
    }
  },

  async confirmPasswordReset(req, res) {
    try {
      const { token, password } = req.body;

      const resetToken = await passwordResetTokenDatamapper.getUserByToken(token);
      if (!resetToken) return res.status(400).json({ message: "Invalid or expired token" });

      await userDatamapper.updatePassword(resetToken.userId, password);
      await passwordResetTokenDatamapper.deleteToken(token);

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating password");
    }
  },
};

module.exports = authController;
