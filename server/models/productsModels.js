const pool = require('../db/index');

function convertToEmbedUrl(url) {
  if (!url) return '';
  return url.replace('watch?v=', 'embed/');
};

async function getAllProducts() {
  try {
      let query = `
      SELECT
        brands.name AS brand,
        products.id,
        products.name,
        products.price,
        products.stock,
        products.image_url
      FROM products
      JOIN brands ON products.brand_id = brands.id
      `;

      const result = await pool.query(query);
      return result.rows
  } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
  }
};

async function getFilteredProducts({
    categoryId,
    brandId = null,
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
    inStockOnly = false,
    sortOrder = 'ASC', // or 'DESC'
  }) {
    try {
      let query = `
        SELECT 
          brands.name AS brand,
          products.id,
          products.name,
          products.price,
          products.stock,
          products.image_url
        FROM products
        JOIN brands ON products.brand_id = brands.id
        WHERE products.category_id = $1
          AND products.price BETWEEN $2 AND $3
      `;
  
      const params = [categoryId, minPrice, maxPrice];
      let paramIndex = params.length;
  
      // Optional brand filter
      if (brandId) {
        paramIndex++;
        query += ` AND products.brand_id = $${paramIndex}`;
        params.push(brandId);
      }
  
      // Optional stock filter
      if (inStockOnly) {
        query += ` AND products.stock > 0`;
      }
  
      // Sorting
      query += ` ORDER BY products.price ${sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
  
      const { rows } = await pool.query(query, params);
      return rows;
  
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      throw error;
    }
};

async function getProductById(id) {
    try {
        let query = `
        SELECT 
          products.id AS id,
          brands.name AS brand,
          products.name,
          products.description,
          products.price,
          products.stock,
          products.image_url2,
          products.video_url
        FROM products
        JOIN brands ON products.brand_id = brands.id
        WHERE products.id = $1
        `;

        const result = await pool.query(query, [id]);
        return result.rows;
    } catch(error) {
        console.error('Error fetching product by id:', error);
        throw error;
    }
};

module.exports = { getFilteredProducts, getProductById, convertToEmbedUrl, getAllProducts }