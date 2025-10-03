class Product {
  constructor({
    id,
    name,
    brand,
    description,
    price,
    stock,
    imageUrl,
    imageUrl2,
    videoUrl,
  }) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.imageUrl = imageUrl;
    this.imageUrl2 = imageUrl2;
    this.videoUrl = videoUrl;
  }

  embedVideoUrl() {
    if (!this.videoUrl) return "";
    return this.videoUrl.replace("watch?v=", "embed/");
  }
}

module.exports = Product;
