const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../middlewares/checkAuth");
const {
  getOrdersByUserId,
  getItemsByOrderId,
} = require("../models/orderModels");

router.get("/", checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await getOrdersByUserId(userId);

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("GET /orders/", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/items", checkAuthenticated, async (req, res) => {
  try {
    const order_id = req.query.order_id;

    if (!order_id) {
      return res.status(400).json({ error: "order_id is required" });
    }

    const items = await getItemsByOrderId(order_id);
    return res.status(200).json({ items });
  } catch (error) {
    console.error("GET /orders/items", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
