const express = require('express');
const router = express.Router();
const { checkAuthenticated, checkNotAuthenticated } = require('../middlewares/checkAuth');
const { getOrdersByUserId, getItemsByOrderId } = require('../models/orderModels');

router.get('/', checkAuthenticated, async (req, res) => {
    try {
      const user_id = req.user.id;
  
      // Fetch orders by user ID
      const orders = await getOrdersByUserId(user_id);

      // Attach items to each order
      if (orders && orders.length > 0) {
        await Promise.all(
          orders.map(async (order) => {
            const items = await getItemsByOrderId(order.id);
            order.items = items; //
          })
        )
      };
      return res.render('orders.ejs', { orders: orders });
    } catch (error) {
      console.error('GET /orders/', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router