const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/checkAuth");
const validateRegister = require("../middlewares/validateRegister");
const validateLogin = require("../middlewares/validateLogin");
const handleValidation = require("../middlewares/handleValidation");

const { registerUser, findUserByEmail } = require("../models/userModels");
const { registerAddress } = require("../models/addressModels");
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
      const {
        email,
        password,
        first_name,
        last_name,
        phone_number,
        street,
        city,
        state,
        postal_code,
        country,
      } = req.body;

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

      const addressData = {
        user_id: newUser.id,
        street,
        city,
        state,
        postal_code,
        country,
      };

      await registerAddress(addressData);
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
          // Merge the temporary cart
          const temporaryCart = JSON.parse(req.body.temporaryCart || "[]");
          const cart = await getCartByUserId(user.id);
          const cartItems = await getItemsByCartId(cart.id);

          temporaryCart.forEach((item) => {
            const existingItem = cartItems.find(
              (ci) => ci.product_id == item.product_id,
            );
            if (existingItem) {
              existingItem.quantity += item.quantity;
            } else {
              cartItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
              });
            }
          });

          await saveUserCart(cart.id, cartItems);

          return res.json({
            success: true,
            user: { id: user.id, email: user.email },
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "Cart merge failed" });
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

module.exports = router;
