const express = require("express");
const router = express.Router();
const {
  getCartByUserId,
  getItemsByCartId,
  addItemToCart,
  updateItemInCart,
  getPriceByItemId,
  clearCart,
} = require("../models/cartModels");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/checkAuth");

router.get("/", checkAuthenticated, async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId || userId != req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    };

    const cart = await getCartByUserId(req.query.userId);
    const cartItems = await getItemsByCartId(cart.id);

    const finalPrice = cartItems.reduce((acc, item) => {
      const price = parseFloat(item.total_price);
      return acc + price;
    }, 0);

    res
      .status(200)
      .json({ products: cartItems, final_price: finalPrice, cart_id: cart.id });
  } catch (error) {
    console.error("GET /cart/", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/add", checkAuthenticated, async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: "Missing product_id" });

    const cart = await getCartByUserId(req.user.id);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const cartItems = await getItemsByCartId(cart.id);
    const itemToUpdate = cartItems.find(item => item.product_id == product_id);

    if (itemToUpdate) {
      await updateItemInCart(product_id, cart.id, 1);
    } else {
      await addItemToCart(product_id, cart.id, 1);
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("POST /cart/add", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/updateQuantity", checkAuthenticated, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const cart = await getCartByUserId(req.user.id);

    if (!cart) return res.status(404).json({ error: "Cart not found" });
    await updateItemInCart(product_id, cart.id, quantity);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("POST /cart/removeOne", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
