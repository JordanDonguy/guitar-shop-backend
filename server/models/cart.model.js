class Cart {
  constructor({ id, user_id }) {
    this.id = id;
    this.userId = user_id;
  }
}

class CartItem {
  constructor({
    id,
    cart_id,
    product_id,
    quantity,
    price,
    total_price,
    image_url,
    name,
    brand,
    category,
  }) {
    this.id = id;
    this.cartId = cart_id;
    this.productId = product_id;
    this.quantity = quantity;
    this.price = price;
    this.totalPrice = total_price;
    this.imageUrl = image_url;
    this.productName = name;
    this.brandName = brand;
    this.categoryName = category;
  }
}

module.exports = { Cart, CartItem };
