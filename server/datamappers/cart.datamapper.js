const pool = require("../db/index");
const { Cart, CartItem } = require("../models/cart.model");

const cartDatamapper = {
  async createCart(userId) {
    const query = `
      INSERT INTO shopping_cart (user_id)
      VALUES ($1)
      RETURNING id, user_id
    `;
    const result = await pool.query(query, [userId]);
    return new Cart(result.rows[0]);
  },

  async getCartByUserId(userId) {
    const query = `SELECT id, user_id FROM shopping_cart WHERE user_id = $1`;
    const result = await pool.query(query, [userId]);
    return result.rows[0] ? new Cart(result.rows[0]) : null;
  },

  async getItemsByCartId(cartId) {
    const query = `
      SELECT 
        cart_items.id,
        cart_items.cart_id,
        product_id,
        quantity, 
        products.price,
        quantity*products.price AS total_price,
        products.image_url,
        products.name,
        brands.name AS brand,
        categories.name AS category
      FROM cart_items
      JOIN products ON product_id = products.id
      JOIN brands ON products.brand_id = brands.id
      JOIN categories ON products.category_id = categories.id
      WHERE cart_id = $1
    `;
    const result = await pool.query(query, [cartId]);
    return result.rows.map((row) => new CartItem(row));
  },

  async addItemToCart(productId, cartId, quantity) {
    const query = `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *`;
    const values = [cartId, productId, quantity];
    const result = await pool.query(query, values);
    return new CartItem(result.rows[0]);
  },

  async updateItemInCart(productId, cartId, quantity) {
    const quantityQuery = `
      SELECT quantity FROM cart_items
      WHERE product_id = $1 AND cart_id = $2
    `;
    const updateQuery = `
      UPDATE cart_items
      SET quantity = quantity + $3
      WHERE product_id = $1 AND cart_id = $2
      RETURNING *`;
    const removeQuery = `
      DELETE FROM cart_items
      WHERE product_id = $1 AND cart_id = $2
      RETURNING *`;

    const current = await pool.query(quantityQuery, [productId, cartId]);
    if (!current.rows.length) throw new Error("Item not in cart");

    const currentQty = current.rows[0].quantity;

    if (quantity > 0 || currentQty + quantity > 0) {
      const result = await pool.query(updateQuery, [
        productId,
        cartId,
        quantity,
      ]);
      return new CartItem(result.rows[0]);
    } else {
      const result = await pool.query(removeQuery, [productId, cartId]);
      return result.rows[0] ? new CartItem(result.rows[0]) : null;
    }
  },

  async saveUserCart(cartId, userCart) {
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
    for (const item of userCart) {
      await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [cartId, item.productId, item.quantity],
      );
    }
  },

  async clearCart(cartId) {
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
  },
};

module.exports = cartDatamapper;
