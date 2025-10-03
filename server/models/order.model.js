class Order {
  constructor({
    id,
    user_id,
    shipping_address_id,
    total_price,
    status,
    payment_method,
    created_at,
    first_name,
    last_name,
  }) {
    this.id = id;
    this.userId = user_id;
    this.shippingAddressId = shipping_address_id;
    this.totalPrice = total_price;
    this.status = status;
    this.paymentMethod = payment_method;
    this.createdAt = created_at;
    this.userFirstName = first_name;
    this.userLastName = last_name;
  }
}

class OrderItem {
  constructor({
    order_id,
    product_id,
    quantity,
    unit_price,
    brand_name,
    name,
    image_url,
  }) {
    this.orderId = order_id;
    this.productId = product_id;
    this.quantity = quantity;
    this.unitPrice = unit_price;
    this.brandName = brand_name;
    this.productName = name;
    this.imageUrl = image_url;
  }
}

module.exports = { Order, OrderItem };
