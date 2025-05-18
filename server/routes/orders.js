const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../middlewares/checkAuth");
const {
  getOrdersByUserId,
  getItemsByOrderId,
} = require("../models/orderModels");

router.get("/", checkAuthenticated, async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId || userId != req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const orders = await getOrdersByUserId(userId);

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("GET /orders/", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/items", checkAuthenticated, async (req, res) => {
  try {
    const userId = req.query.userId;
    const order_id = req.query.order_id;

    if (!userId || userId != req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const items = await getItemsByOrderId(order_id);
    return res.status(200).json({ items });
  } catch (error) {
    console.error("GET /orders/items", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
