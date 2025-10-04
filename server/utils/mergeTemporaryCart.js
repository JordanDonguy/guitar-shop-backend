const cartDatamapper = require("../datamappers/cart.datamapper");

async function mergeTemporaryCart(userId, temporaryCart) {
  const cart = await cartDatamapper.getCartByUserId(userId);
  const cartItems = await cartDatamapper.getItemsByCartId(cart.id);

  temporaryCart.forEach((item) => {
    const existingItem = cartItems.find((ci) => ci.productId == item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cartItems.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }
  });

  await cartDatamapper.saveUserCart(cart.id, cartItems);
}

module.exports = mergeTemporaryCart;
