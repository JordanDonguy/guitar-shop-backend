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
        console.error('Error fetching cart : ', error);
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
        console.error('Error fetching cart items : ', error);
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
        console.error('error fetching product price : ', error);
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
        console.error('error adding product to cart : ', error);
        throw error
    }
};

async function updateItemInCart(id, quantity) {
    try {
        // Query to get the current quantity of the item
        const quantityQuery = `
            SELECT quantity
            FROM cart_items
            WHERE id = $1
        `;
        
        // Query to update the quantity of the item in the cart
        const updateQuery = `
            UPDATE cart_items
            SET quantity = quantity + $2
            WHERE id = $1
            RETURNING *
        `;
        
        // Query to remove the item from the cart if quantity is 0
        const removeQuery = `
            DELETE FROM cart_items
            WHERE id = $1 
            RETURNING *
        `;
        
        // Get the current quantity of the item
        const itemQuantityResult = await pool.query(quantityQuery, [id]);
        if (itemQuantityResult.rows.length === 0) {
            throw new Error('Item not found in the cart');
        }

        const currentQuantity = itemQuantityResult.rows[0].quantity;

        // If the new quantity is positive, update the item quantity
        if (quantity > 0) {
            const values = [id, quantity];
            const result = await pool.query(updateQuery, values);
            return result.rows[0];
        }

        // If the quantity to decrement is negative, handle based on current quantity
        if (quantity < 0) {
            if (currentQuantity + quantity > 0) {
                // If the item quantity is still positive after decrement, update it
                const values = [id, quantity];
                const result = await pool.query(updateQuery, values);
                return result.rows[0];
            } else if (currentQuantity + quantity <= 0) {
                // If the quantity goes to 0 or below, delete the item
                const result = await pool.query(removeQuery, [id]);
                return result.rows[0];
            }
        }
    } catch (error) {
        console.error('error updating product in cart : ', error);
        throw error;
    }
};

module.exports = { getCartByUserId, getItemsByCartId, addItemToCart, updateItemInCart, getPriceByItemId };