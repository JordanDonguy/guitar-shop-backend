const pool = require("../db/index");

function convertToEmbedUrl(url) {
  if (!url) return "";
  return url.replace("watch?v=", "embed/");
}

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
    return result.rows;
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error;
  }
}

async function getFilteredProducts({
  categoryIds,
  brandIds,
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  inStockOnly = false,
  sortOrder = "ASC",
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
        WHERE products.price BETWEEN $1 AND $2
      `;

    const params = [minPrice, maxPrice];
    let paramIndex = params.length;

    // Optional category filter (multiple category IDs)
    if (categoryIds && categoryIds.length > 0) {
      const placeholders = categoryIds.map(() => `$${++paramIndex}`).join(", ");
      query += ` AND products.category_id IN (${placeholders})`;
      params.push(...categoryIds);
    }

    // Optional brand filter
    if (brandIds && brandIds.length > 0) {
      const placeholders = brandIds.map(() => `$${++paramIndex}`).join(", ");
      query += ` AND products.brand_id IN (${placeholders})`;
      params.push(...brandIds);
    }

    // Optional stock filter
    if (inStockOnly) {
      query += ` AND products.stock > 0`;
    }

    // Sorting
    query += ` ORDER BY products.price ${sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"}`;

    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    throw error;
  }
}

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
          products.image_url,
          products.image_url2,
          products.video_url
        FROM products
        JOIN brands ON products.brand_id = brands.id
        WHERE products.id = $1
        `;

    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching product by id:", error);
    throw error;
  }
}

module.exports = { getFilteredProducts, getProductById, convertToEmbedUrl };
