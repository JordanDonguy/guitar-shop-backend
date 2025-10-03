const pool = require("../db/index");
const { Order, OrderItem } = require("../models/order.model");

const orderDatamapper = {
  async addNewOrder(userId, shippingAddressId, totalPrice) {
    const query = `
      INSERT INTO orders (user_id, shipping_address_id, total_price)
      VALUES ($1, $2, $3)
      RETURNING *`;
    const values = [userId, shippingAddressId, totalPrice];
    const result = await pool.query(query, values);
    return new Order(result.rows[0]);
  },

  async addItemToOrder(orderId, productId, quantity, unitPrice) {
    const query = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (order_id, product_id) DO UPDATE
      SET quantity = order_items.quantity + EXCLUDED.quantity
      RETURNING *`;
    const values = [orderId, productId, quantity, unitPrice];
    const result = await pool.query(query, values);
    return new OrderItem(result.rows[0]);
  },

  async getOrdersByUserId(userId) {
    const query = `
      SELECT
        orders.id,
        payment_method,
        shipping_address_id,
        user_id,
        total_price,
        status,
        orders.created_at,
        users.first_name,
        users.last_name
      FROM orders
      JOIN users ON orders.user_id = users.id
      WHERE user_id = $1`;
    const result = await pool.query(query, [userId]);
    return result.rows.map((row) => new Order(row));
  },

  async getItemsByOrderId(orderId) {
    const query = `
      SELECT 
        order_id,
        quantity,
        unit_price,
        brands.name AS brand_name,
        products.id AS product_id,
        products.name,
        products.image_url
      FROM order_items
      JOIN products ON order_items.product_id = products.id
      JOIN brands ON products.brand_id = brands.id
      WHERE order_items.order_id = $1`;
    const result = await pool.query(query, [orderId]);
    return result.rows.map((row) => new OrderItem(row));
  },
};

module.exports = orderDatamapper;
