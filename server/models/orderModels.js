const pool = require('../db/index');

async function addNewOrder(user_id, shipping_address_id, total_price) {
    try {
        let query = `
        INSERT INTO orders (user_id, shipping_address_id, total_price)
        VALUES ($1, $2, $3)
        RETURNING *
        `;
        
        const values = [user_id, shipping_address_id, total_price];

        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('error adding order to database : ', error);
        throw error
    }
};

async function addItemToOrder(order_id, product_id, quantity, unit_price) {
    try {
        let query = `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (order_id, product_id) DO UPDATE
        SET quantity = order_items.quantity + EXCLUDED.quantity;
        `;

        const values = [order_id, product_id, quantity, unit_price];

        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('error adding item to order : ', error);
        throw error
    }
};

async function getOrdersByUserId(user_id) {
    try {
        let query = `
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
        WHERE user_id = $1
        `;

        const result = await pool.query(query, [user_id]);
        return result.rows;
    } catch (error) {
        console.error('error fetching orders : ', error);
        throw error
    }
};

async function getItemsByOrderId(order_id) {
    try {
        let query = `
        SELECT 
        order_id,
        quantity,
        unit_price,
        brands.name AS brand_name,
        products.id,
        products.name,
        products.image_url
        FROM order_items
        JOIN products ON order_items.product_id = products.id
        JOIN brands ON products.brand_id = brands.id
        WHERE order_items.order_id = $1
        `;

        const result = await pool.query(query, [order_id]);
        return result.rows;
    } catch (error) {
        console.error('error fetching items : ', error);
        throw error
    }
};

module.exports = { addNewOrder, addItemToOrder, getOrdersByUserId, getItemsByOrderId }