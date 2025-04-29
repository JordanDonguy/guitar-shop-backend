const pool = require('../db/index');

async function addNewOrder(user_id, shipping_address_id, total_price) {
    try {
        let query = `
        INSERT INTO orders (user_id, shipping_address_id, total_price)
        VALUES ($1, $2, $3)
        RETURNING *
        `;
        
        const values = [user_id, shipping_address_id, total_price];
        console.log(user_id, shipping_address_id, total_price);
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

module.exports = { addNewOrder, addItemToOrder }