const pool = require('../db/index');


async function getCartByUserId(user_id) {

    try {
        let query = `
        SELECT  id
        FROM shopping_cart
        WHERE user_id = $1
        `
        const result = await pool.query(query, [user_id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching cart', error);
        throw error;
    }
};

async function getItemsByCartId(cart_id) {
    try {
        let query = `
        SELECT 
        cart_items.id,
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
        `
        const result = await pool.query(query, [cart_id]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching cart items', error);
        throw error;
    }
};

async function getPriceByItemId(item_id) {
    try {
        let query = `
        SELECT price
        FROM products
        WHERE id = $1
        `
        const result = pool.query(query, [item_id]);
        return result.rows[0] || null
    } catch (error) {
        console.error('error fetching product price', error);
        throw error;
    }
}

async function addItemToCart(cart_id, product_id, quantity) {
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
        throw error
    }
};

async function updateItemInCart(id, quantity) {
    try {
        let query = `
        UPDATE cart_items
        SET quantity = quantity + $2
        WHERE id = $1
        RETURNING *
        `
        const values = [id, quantity];

        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error
    }
};

// Function to load cart from LocalStorage
function loadCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
};

// Function to save cart to LocalStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
};

// Function to add an item to the cart
function addToCart(product) {
  const cart = loadCart();
  cart.push(product);
  saveCart(cart);
  console.log('Added to cart:', product);
};

module.exports = { getCartByUserId, getItemsByCartId, addItemToCart, updateItemInCart, getPriceByItemId, loadCart, saveCart, addToCart };