const express = require("express");
const router = express.Router();
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/checkAuth");
const { addNewOrder, addItemToOrder } = require("../models/orderModels");
const { getAddressId } = require("../models/addressModels");
const {
  getItemsByCartId,
  clearCart,
  getCartByUserId,
} = require("../models/cartModels");

function isFakeCardValid(cardNumber, expiry, cvv) {
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (
    cardNumber.length === 16 &&
    expiryRegex.test(expiry) &&
    cvv.length === 3
  ) {
    return true;
  } else {
    return false;
  }
}

router.post("/initiate", (req, res) => {
  try {
    const { cart_id, total_price } = req.body;
    req.session.checkoutData = { cart_id, total_price };

    res.redirect("/checkout");
  } catch (error) {
    console.error("POST /checkout/initiate", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", checkAuthenticated, (req, res) => {
  try {
    const data = req.session.checkoutData;

    if (!data) return res.redirect("/cart");
    res.render("checkout.ejs", data);
  } catch (error) {
    console.error("GET /checkout/", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", checkAuthenticated, async (req, res) => {
  try {
    const { cardNumber, expiry, cvv, total_price, user } = req.body;
    const userCart = await getCartByUserId(user.id);
    const cart_id = userCart.id;

    if (!total_price || !cart_id) {
      return res.redirect("/cart");
    }

    // Check if card information is valid
    const isCardValid = isFakeCardValid(cardNumber, expiry, cvv);
    if (!isCardValid) {
      return res.status(400).render("checkout.ejs", {
        total_price,
        cart_id,
        error: "Card details are incorrect. Please check and try again.",
      });
    }

    // Get user_id and address_id
    const address = await getAddressId(user.id);
    const address_id = address.id;

    // Create a new order
    const newOrder = await addNewOrder(user.id, address_id, total_price);

    if (!newOrder) {
      return res.status(500).send("Failed to create order");
    }

    // Add items to order
    const cart = await getItemsByCartId(cart_id);

    await Promise.all(
      cart.map((item) =>
        addItemToOrder(newOrder.id, item.product_id, item.quantity, item.price),
      ),
    );

    // Clear cart after successful order
    await clearCart(cart_id);

    // Redirect to confirmation or cart
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("POST /checkout/", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
