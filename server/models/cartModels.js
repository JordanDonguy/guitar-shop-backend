const pool = require("../db/index");

async function createCart(user_id) {
  try {
    let query = `
        INSERT INTO shopping_cart (user_id)
        VALUES ($1)
        ON CONFLICT (user_id)
        DO NOTHING
        `;

    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating cart : ", error);
    throw error;
  }
}

async function getCartByUserId(user_id) {
  try {
    let query = `
        SELECT  id
        FROM shopping_cart
        WHERE user_id = $1
        `;
    const result = await pool.query(query, [user_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching cart : ", error);
    throw error;
  }
}

async function getItemsByCartId(cart_id) {
  try {
    let query = `
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
    const result = await pool.query(query, [cart_id]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching cart items : ", error);
    throw error;
  }
}

async function getPriceByItemId(item_id) {
  try {
    let query = `
        SELECT price
        FROM products
        WHERE id = $1
        `;
    const result = pool.query(query, [item_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("error fetching product price : ", error);
    throw error;
  }
}

async function addItemToCart(product_id, cart_id, quantity) {
  try {
    let query = `
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING cart_id, product_id, quantity
        `;
    const values = [cart_id, product_id, quantity];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("error adding product to cart : ", error);
    throw error;
  }
}

async function updateItemInCart(product_id, cart_id, quantity) {
  try {
    // Query to get the current quantity of the item
    const quantityQuery = `
            SELECT quantity
            FROM cart_items
            WHERE product_id = $1
            AND cart_id = $2
        `;

    // Query to update the quantity of the item in the cart
    const updateQuery = `
            UPDATE cart_items
            SET quantity = quantity + $3
            WHERE product_id = $1
            AND cart_id = $2
            RETURNING *
        `;

    // Query to remove the item from the cart if quantity is 0
    const removeQuery = `
            DELETE FROM cart_items
            WHERE product_id = $1
            AND cart_id = $2
            RETURNING *
        `;

    // Get the current quantity of the item
    const itemQuantityResult = await pool.query(quantityQuery, [
      product_id,
      cart_id,
    ]);
    if (itemQuantityResult.rows.length === 0) {
      throw new Error("Item not found in the cart");
    }

    const currentQuantity = itemQuantityResult.rows[0].quantity;

    // If the new quantity is positive, update the item quantity
    if (quantity > 0) {
      const values = [product_id, cart_id, quantity];
      const result = await pool.query(updateQuery, values);
      return result.rows[0];
    }

    // If the quantity to decrement is negative, handle based on current quantity
    if (quantity < 0) {
      if (currentQuantity + quantity > 0) {
        // If the item quantity is still positive after decrement, update it
        const values = [product_id, cart_id, quantity];
        const result = await pool.query(updateQuery, values);
        return result.rows[0];
      } else if (currentQuantity + quantity <= 0) {
        // If the quantity goes to 0 or below, delete the item
        const result = await pool.query(removeQuery, [product_id, cart_id]);
        return result.rows[0];
      }
    }
  } catch (error) {
    console.error("error updating product in cart : ", error);
    throw error;
  }
}

async function saveUserCart(cartId, userCart) {
  // First, clear the user's existing cart (if necessary)
  await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);

  // Now insert the updated cart items
  for (const item of userCart) {
    let query = `
        INSERT INTO 
        cart_items (cart_id, product_id, quantity) 
        VALUES ($1, $2, $3)
        `;
    await pool.query(query, [cartId, item.product_id, item.quantity]);
  }
}

async function clearCart(cartId) {
  await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
}

module.exports = {
  createCart,
  getCartByUserId,
  getItemsByCartId,
  addItemToCart,
  updateItemInCart,
  getPriceByItemId,
  saveUserCart,
  clearCart,
};
