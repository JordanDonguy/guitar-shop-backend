const express = require('express');
const router = express.Router();
const { getCartByUserId, getItemsByCartId, addItemToCart, updateItemInCart, getPriceByItemId } = require('../models/cartModels');
const { checkAuthenticated, checkNotAuthenticated } = require('../middlewares/checkAuth');

router.get('/', async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const cart = await getCartByUserId(req.user.id);
            const cartItems = await getItemsByCartId(cart.id);
            const finalPrice = cartItems.reduce((acc, item) => {return acc + item.total_price});
            res.render('cart.ejs', { products: cartItems, isAuthenticated: req.isAuthenticated(), final_price: finalPrice });
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
            console.log(newItem)
            res.status(201).redirect('/cart');
        }
    } catch (error) {

    }
});

router.patch('/update/:id', async (req, res) => {
    try {
        const cart = await getCartByUserId(req.user.id);
        const cartItems = await getItemsByCartId(cart.id);
        const itemToUpdate = await cartItems.find(item => item.product_id == req.body.product_id);

        const itemUpdated  = await updateItemInCart(itemToUpdate.id, 1);
        res.status(201).redirect('/cart');
    } catch (error) {

    }
})

module.exports = router;