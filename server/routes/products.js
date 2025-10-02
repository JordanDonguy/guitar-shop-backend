const express = require("express");
const router = express.Router();
const pool = require("../db/index");
const {
  getFilteredProducts,
  getProductById,
  convertToEmbedUrl,
} = require("../models/productsModels");
const { getAllCategories } = require("../models/categoriesModels");
const brandDatamapper = require("../datamappers/brand.datamapper");

router.get("/", async (req, res) => {
  try {
    // Get filters from query string
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
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Number.MAX_SAFE_INTEGER;
    const inStockOnly = req.query.inStock === "true";
    const sortOrder = req.query.sort === "asc" ? "ASC" : "DESC";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || "";

    const result = await getFilteredProducts({
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

    const categories = await getAllCategories();
    const brands = await brandDatamapper.findAll();

    const products = result.products;
    const totalPages = result.totalPages;

    res.status(200).json({ products, categories, brands, totalPages });
  } catch (error) {
    console.error("GET /products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const rawProduct = await getProductById(req.params.id);
    const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;

    const rawVideoUrl = product.video_url;

    const productData = {
      ...product,
      video_url: convertToEmbedUrl(rawVideoUrl),
    };

    res
      .status(200)
      .json({ product: productData, isAuthenticated: req.isAuthenticated() });
  } catch (error) {
    console.error("GET /products/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
