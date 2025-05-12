const express = require('express');
const router = express.Router();
const { getCartByUserId, getItemsByCartId, addItemToCart, updateItemInCart, getPriceByItemId, clearCart } = require('../models/cartModels');
const { checkAuthenticated, checkNotAuthenticated } = require('../middlewares/checkAuth');

router.get('/', async (req, res) => {
    try {
            const cart = await getCartByUserId(req.query.userId);
            const cartItems = await getItemsByCartId(cart.id);

            const finalPrice = cartItems.reduce((acc, item) => {
                const price = parseFloat(item.total_price);  // Convert to number if it's a string
                return acc + price;
            }, 0);

            res.status(200).json({ products: cartItems, final_price: finalPrice, cart_id: cart.id });
    } catch (error) {
        console.error('GET /cart/', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/add', async (req, res) => {
    try {
        const { user, product_id } = req.body;
        const cart = await getCartByUserId(user.id);
        const cartItems = await getItemsByCartId(cart.id);

        const itemToUpdate = cartItems.find(item => item.product_id == product_id && item.cart_id == cart.id);

        if (itemToUpdate) {
            const itemUpdated = await updateItemInCart(product_id, cart.id, 1);
            res.status(201).json({ success: true })
        } else {
            const newItem = await addItemToCart(product_id, cart.id, 1);
            res.status(201).json({ success: true })
        }
    } catch (error) {
        console.error('POST /cart/add/:id', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/updateQuantity', (req, res) => {
    try {
        const { product_id, cart_id, quantity } = req.body;
        console.log(quantity)
        updateItemInCart(product_id, cart_id, quantity);

        res.status(200).json({ success: true })
    } catch (error) {
        console.error('POST /cart/removeOne', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
