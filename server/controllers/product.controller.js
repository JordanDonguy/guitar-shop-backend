const productDatamapper = require("../datamappers/product.datamapper");
const brandDatamapper = require("../datamappers/brand.datamapper");
const categoryDatamapper = require("../datamappers/category.datamapper");

const productController = {
  async getProducts(req, res) {
    try {
      const categoryIds = req.query.categoryId
        ? Array.isArray(req.query.categoryId)
          ? req.query.categoryId.map((id) => parseInt(id))
          : [parseInt(req.query.categoryId)]
        : [];

      const brandIds = req.query.brandId
        ? Array.isArray(req.query.brandId)
          ? req.query.brandId.map((id) => parseInt(id))
          : [parseInt(req.query.brandId)]
        : [];

      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
      const maxPrice = req.query.maxPrice
        ? parseFloat(req.query.maxPrice)
        : Number.MAX_SAFE_INTEGER;
      const inStockOnly = req.query.inStock === "true";
      const sortOrder = req.query.sort === "asc" ? "ASC" : "DESC";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const searchTerm = req.query.search || "";

      const result = await productDatamapper.getFilteredProducts({
        categoryIds,
        brandIds,
        minPrice,
        maxPrice,
        inStockOnly,
        sortOrder,
        page,
        limit,
        searchTerm,
      });

      const categories = await categoryDatamapper.findAll();
      const brands = await brandDatamapper.findAll();

      res.status(200).json({ ...result, categories, brands });
    } catch (error) {
      console.error("GET /products error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getProduct(req, res) {
    try {
      const product = await productDatamapper.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const productData = {
        ...product,
        videoUrl: product.embedVideoUrl(),
      };

      res
        .status(200)
        .json({ product: productData, isAuthenticated: req.isAuthenticated() });
    } catch (error) {
      console.error("GET /products/:id error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = productController;
