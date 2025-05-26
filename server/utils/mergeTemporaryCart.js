const {
  getCartByUserId,
  getItemsByCartId,
  saveUserCart,
} = require("../models/cartModels");

async function mergeTemporaryCart(userId, temporaryCart) {
  const cart = await getCartByUserId(userId);
  const cartItems = await getItemsByCartId(cart.id);

  temporaryCart.forEach((item) => {
    const existingItem = cartItems.find(
      (ci) => ci.product_id == item.product_id,
    );
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cartItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
      });
    }
  });

  await saveUserCart(cart.id, cartItems);
}

module.exports = mergeTemporaryCart;
