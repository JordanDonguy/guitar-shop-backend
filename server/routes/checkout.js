const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../middlewares/checkAuth");
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

router.post("/", checkAuthenticated, async (req, res) => {
  try {
    const { cardNumber, expiry, cvv } = req.body;

    if (!isFakeCardValid(cardNumber, expiry, cvv)) {
      return res.status(400).json({
        error: "Card details are incorrect. Please check and try again.",
      });
    }

    const userId = req.user.id;
    const cart = await getCartByUserId(userId);
    const cartItems = await getItemsByCartId(cart.id);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    const total_price = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.total_price),
      0,
    );

    const address = await getAddressId(userId);
    if (!address) return res.status(400).json({ error: "No address on file." });

    const order = await addNewOrder(userId, address.id, total_price);
    if (!order)
      return res.status(500).json({ error: "Failed to create order" });

    await Promise.all(
      cartItems.map((item) =>
        addItemToOrder(
          order.id,
          item.product_id,
          item.quantity,
          Number(item.price),
        ),
      ),
    );

    await clearCart(cart.id);

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("POST /checkout/", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
