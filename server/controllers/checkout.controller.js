const cartDatamapper = require("../datamappers/cart.datamapper");
const orderDatamapper = require("../datamappers/order.datamapper");
const addressDatamapper = require("../datamappers/address.datamapper");

function isFakeCardValid(cardNumber, expiry, cvv) {
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  return (
    cardNumber.length === 16 && expiryRegex.test(expiry) && cvv.length === 3
  );
}

const checkoutController = {
  async processCheckout(req, res) {
    try {
      const { cardNumber, expiry, cvv } = req.body;
      if (!isFakeCardValid(cardNumber, expiry, cvv)) {
        return res.status(400).json({ error: "Card details are incorrect." });
      }

      const userId = req.user.id;
      const cart = await cartDatamapper.getCartByUserId(userId);
      if (!cart) return res.status(400).json({ error: "Cart not found." });

      const cartItems = await cartDatamapper.getItemsByCartId(cart.id);
      if (!cartItems || cartItems.length === 0)
        return res.status(400).json({ error: "Your cart is empty." });

      const totalPrice = cartItems.reduce(
        (sum, item) => sum + Number(item.totalPrice),
        0,
      );

      const address = await addressDatamapper.findByUserId(userId);
      if (!address)
        return res.status(400).json({ error: "No address on file." });

      const order = await orderDatamapper.addNewOrder(
        userId,
        address.id,
        totalPrice,
      );
      if (!order)
        return res.status(500).json({ error: "Failed to create order" });

      await Promise.all(
        cartItems.map((item) =>
          orderDatamapper.addItemToOrder(
            order.id,
            item.productId,
            item.quantity,
            item.price,
          ),
        ),
      );

      await cartDatamapper.clearCart(cart.id);
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("POST /checkout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = checkoutController;
