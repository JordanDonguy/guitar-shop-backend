const express = require("express");
const router = express.Router();
const passport = require("passport");
const mergeTemporaryCart = require("../utils/mergeTemporaryCart");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/checkAuth");
const validateRegister = require("../middlewares/validateRegister");
const validateLogin = require("../middlewares/validateLogin");
const handleValidation = require("../middlewares/handleValidation");

const { registerUser, findUserByEmail } = require("../models/userModels");
const { getAllCountries } = require("../models/countryModels");
const {
  getCartByUserId,
  getItemsByCartId,
  saveUserCart,
  createCart,
} = require("../models/cartModels");

// Register route

router.get("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const countries = await getAllCountries();
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

      await createCart(newUser.id);

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
            user: { id: user.id, email: user.email }
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

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err || !user) {
      return res.redirect('http://localhost:5173/auth/login?status=error');
    }

    // Log the user in
    req.logIn(user, (err) => {
      if (err) {
        return res.redirect('http://localhost:5173/auth/login?status=error');
      }

      const isNewUser = info?.isNewUser;

      const redirectURL = isNewUser
        ? 'http://localhost:5173/?status=success&type=register'
        : 'http://localhost:5173/?status=success&type=login';

      return res.redirect(redirectURL);
    });
  })(req, res, next);
});


module.exports = router;
