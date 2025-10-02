const orderDatamapper = require("../datamappers/order.datamapper");

const orderController = {
  async getOrdersByUser(req, res) {
    try {
      const userId = req.user.id;
      const orders = await orderDatamapper.getOrdersByUserId(userId);
      res.status(200).json({ orders });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getItemsByOrder(req, res) {
    try {
      const orderId = req.query.order_id;
      if (!orderId) {
        return res.status(400).json({ error: "order_id is required" });
      }
      const items = await orderDatamapper.getItemsByOrderId(orderId);
      res.status(200).json({ items });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = orderController;
