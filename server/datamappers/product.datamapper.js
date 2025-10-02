const pool = require("../db/index");
const Product = require("../models/product.model");

const productDatamapper = {
  async getFilteredProducts({
    categoryIds,
    brandIds,
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
    inStockOnly = false,
    sortOrder = "ASC",
    page = 1,
    limit = 10,
    searchTerm = "",
  }) {
    let baseQuery = `
      FROM products
      JOIN brands ON products.brand_id = brands.id
      WHERE products.price BETWEEN $1 AND $2
    `;
    const params = [minPrice, maxPrice];
    let paramIndex = params.length;

    if (categoryIds && categoryIds.length) {
      const placeholders = categoryIds.map(() => `$${++paramIndex}`).join(", ");
      baseQuery += ` AND products.category_id IN (${placeholders})`;
      params.push(...categoryIds);
    }

    if (brandIds && brandIds.length) {
      const placeholders = brandIds.map(() => `$${++paramIndex}`).join(", ");
      baseQuery += ` AND products.brand_id IN (${placeholders})`;
      params.push(...brandIds);
    }

    if (inStockOnly) baseQuery += ` AND products.stock > 0`;
    if (searchTerm.trim() !== "") {
      paramIndex++;
      baseQuery += `
        AND (LOWER(products.name) LIKE LOWER($${paramIndex}) 
             OR LOWER(brands.name) LIKE LOWER($${paramIndex}))
      `;
      params.push(`%${searchTerm.trim()}%`);
    }

    const countQuery = `SELECT COUNT(*) ${baseQuery}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT 
        products.id,
        products.name,
        products.description,
        products.price,
        products.stock,
        products.image_url AS "imageUrl",
        products.image_url2 AS "imageUrl2",
        products.video_url AS "videoUrl",
        brands.name AS brand
      ${baseQuery}
      ORDER BY products.price ${sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"}
      LIMIT ${limit} OFFSET ${offset}
    `;
    const dataResult = await pool.query(dataQuery, params);

    const products = dataResult.rows.map(row => new Product(row));

    return {
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  },

  async getProductById(id) {
    const query = `
      SELECT 
        products.id,
        products.name,
        products.description,
        products.price,
        products.stock,
        products.image_url AS "imageUrl",
        products.image_url2 AS "imageUrl2",
        products.video_url AS "videoUrl",
        brands.name AS brand
      FROM products
      JOIN brands ON products.brand_id = brands.id
      WHERE products.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows.length) return null;
    return new Product(result.rows[0]);
  },
};

module.exports = productDatamapper;
