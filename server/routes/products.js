const express = require('express');
const router = express.Router();
const marked = require('marked');
const { getFilteredProducts, getProductById, convertToEmbedUrl, getAllProducts } = require('../models/productsModels');
const { getAllCategories } = require('../models/categoriesModels');

router.get('/', async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.render('categories.ejs', { categories });
    } catch (error) {
        console.error('GET /products/', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/all', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.render('products.ejs', { products, isAuthenticated: req.isAuthenticated() });
  } catch (error) {
    console.error('GET /products/all', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/category/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    // Get filters from query string
    const brandId = req.query.brandId ? parseInt(req.query.brandId) : null;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Number.MAX_SAFE_INTEGER;
    const inStockOnly = req.query.inStock === 'true'; // expects ?inStock=true
    const sortOrder = req.query.sort === 'desc' ? 'DESC' : 'ASC';

    const products = await getFilteredProducts({
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      inStockOnly,
      sortOrder
    });
      
    res.render('products.ejs', { products, isAuthenticated: req.isAuthenticated() });

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
            description_html: marked.parse(product.description || ''),
            video_url: convertToEmbedUrl(rawVideoUrl)
        }; 

        res.render('product.ejs', { product: productData });

    } catch (error) {
        console.error('GET /products/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;