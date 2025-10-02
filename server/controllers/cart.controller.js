const cartDatamapper = require("../datamappers/cart.datamapper");

const cartController = {
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartDatamapper.getCartByUserId(userId);
      if (!cart) return res.status(404).json({ error: "Cart not found" });

      const cartItems = await cartDatamapper.getItemsByCartId(cart.id);
      const finalPrice = cartItems.reduce((acc, item) => acc +  Number(item.totalPrice), 0);
      res.status(200).json({
        products: cartItems,
        finalPrice,
        cartId: cart.id,
      });
    } catch (err) {
      console.error("GET /cart error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async addItem(req, res) {
    try {
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ error: "Missing productId" });

      const cart = await cartDatamapper.getCartByUserId(req.user.id);
      if (!cart) return res.status(404).json({ error: "Cart not found" });

      const cartItems = await cartDatamapper.getItemsByCartId(cart.id);
      const existingItem = cartItems.find(item => item.productId === productId);

      if (existingItem) {
        await cartDatamapper.updateItemInCart(productId, cart.id, 1);
      } else {
        await cartDatamapper.addItemToCart(productId, cart.id, 1);
      }

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("POST /cart/add error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async updateQuantity(req, res) {
    try {
      const { productId, quantity } = req.body;
      const cart = await cartDatamapper.getCartByUserId(req.user.id);
      if (!cart) return res.status(404).json({ error: "Cart not found" });

      await cartDatamapper.updateItemInCart(productId, cart.id, quantity);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("POST /cart/updateQuantity error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async saveTemporaryCart(req, res) {
    try {
      let { temporaryCart } = req.body;
      if (typeof temporaryCart === "string") temporaryCart = JSON.parse(temporaryCart);
      if (!Array.isArray(temporaryCart)) return res.status(400).json({ error: "Invalid cart format" });

      req.session.temporaryCart = temporaryCart;
      res.status(200).json({ message: "Temporary cart saved successfully" });
    } catch (err) {
      console.error("POST /cart/saveTemporaryCart error:", err);
      res.status(500).json({ error: "Failed to save temporary cart" });
    }
  },
};

module.exports = cartController;
