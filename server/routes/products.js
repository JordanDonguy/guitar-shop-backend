const express = require('express');
const router = express.Router();
const marked = require('marked');
const { getFilteredProducts, getProductById, convertToEmbedUrl } = require('../models/productsModels');
const { getAllCategories } = require('../models/categoriesModels');
const { getAllBrands } = require('../models/brandsModels');

router.get('/', async (req, res) => {
  try {
    // Get filters from query string
    const categoryIds = req.query.categoryId 
    ? Array.isArray(req.query.categoryId) 
        ? req.query.categoryId.map(id => parseInt(id))
        : [parseInt(req.query.categoryId)]
    : [];
    const brandIds = req.query.brandId
    ? Array.isArray(req.query.brandId) 
        ? req.query.brandId.map(id => parseInt(id))
        : [parseInt(req.query.brandId)]
    : [];
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Number.MAX_SAFE_INTEGER;
    const inStockOnly = req.query.inStock === 'true';
    const sortOrder = req.query.sort === 'asc' ? 'ASC' : 'DESC';

    const products = await getFilteredProducts({
      categoryIds,
      brandIds,
      minPrice,
      maxPrice,
      inStockOnly,
      sortOrder
    });

    const categories = await getAllCategories();
    const brands = await getAllBrands();
      
    /* res.render('products.ejs', { products, isAuthenticated: req.isAuthenticated() }); */
    res.status(200).json({ products, categories, brands })

  } catch (error) {
    console.error('GET /products/category/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
    try {
        const rawProduct = await getProductById(req.params.id);
        const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;

        const rawVideoUrl = product.video_url;

        const productData = {
            ...product,
            video_url: convertToEmbedUrl(rawVideoUrl)
        }; 

        res.status(200).json({ product: productData, isAuthenticated: req.isAuthenticated() });

    } catch (error) {
        console.error('GET /products/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;