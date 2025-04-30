const express = require('express');
const router = express.Router();
const { getCartByUserId, getItemsByCartId, addItemToCart, updateItemInCart, getPriceByItemId, clearCart } = require('../models/cartModels');
const { checkAuthenticated, checkNotAuthenticated } = require('../middlewares/checkAuth');

router.get('/', async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const cart = await getCartByUserId(req.user.id);
            const cartItems = await getItemsByCartId(cart.id);

            const finalPrice = cartItems.reduce((acc, item) => {
                const price = parseFloat(item.total_price);  // Convert to number if it's a string
                return acc + price;
            }, 0);

            res.render('cart.ejs', { products: cartItems, isAuthenticated: req.isAuthenticated(), final_price: finalPrice, cart_id: cart.id });

        } else {
            res.render('cart.ejs', { isAuthenticated: req.isAuthenticated() });
        };
    } catch (error) {
        console.error('GET /cart/', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/add/:id', async (req, res) => {
    try {
        const cart = await getCartByUserId(req.user.id);
        const cartItems = await getItemsByCartId(cart.id);

        const itemToUpdate = await cartItems.find(item => item.product_id == req.body.product_id);

        if (itemToUpdate) {
            const itemUpdated  = await updateItemInCart(itemToUpdate.id, 1);
            res.status(201).redirect('/cart');
        } else {
            const newItem = await addItemToCart(cart.id, req.body.product_id, 1);
            res.status(201).redirect('/cart');
        }
    } catch (error) {
        console.error('POST /cart/add/:id', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/removeOne', (req, res) => {
    try {
        const { itemId } = req.body;
        updateItemInCart(itemId, -1);

        res.status(200).redirect('/cart')
    } catch (error) {
        console.error('POST /cart/removeOne', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/addOne', (req, res) => {
    try {
        const { itemId } = req.body;
        updateItemInCart(itemId, 1);

        res.status(200).redirect('/cart')
    } catch (error) {
        console.error('POST /cart/addOne', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/clearCart', async (req, res) => {
    try {
        const cartId = req.body['clear-cart'];
        await clearCart(cartId);
        
        res.status(204).redirect('/cart')
    } catch (error) {
        console.error('POST /cart/delete', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;