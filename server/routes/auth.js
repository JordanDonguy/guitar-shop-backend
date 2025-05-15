const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const { registerUser, findUserByEmail } = require("../models/userModels");
const {
  checkAuthenticatd,
  checkNotAuthenticated,
} = require("../middlewares/checkAuth");
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

router.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const existingUser = await findUserByEmail(req.body.email);
    if (existingUser)
      return res
        .status(400)
        .render("register.ejs", { error: "Email already registered" });

    const newUser = await registerUser(req.body);

    const addressData = {
      user_id: newUser.id,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      postal_code: req.body.postal_code,
      country: req.body.country,
    };

    const newAddress = await registerAddress(addressData);

    const newCart = await createCart(newUser.id);

    res.redirect("/auth/login");
  } catch (err) {
    console.error(err);
    res.status(500).render("register.ejs", { error: "Internal server error" });
  }
});

// Login route

router.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

router.post("/login", checkNotAuthenticated, (req, res, next) => {
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

        // ✅ Send JSON instead of redirect
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
});

// Logout route

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/auth/login");
  });
});

module.exports = router;
