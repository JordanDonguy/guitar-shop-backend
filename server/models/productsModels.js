const pool = require("../db/index");

function convertToEmbedUrl(url) {
  if (!url) return "";
  return url.replace("watch?v=", "embed/");
}

async function getFilteredProducts({
  categoryIds,
  brandIds,
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  inStockOnly = false,
  sortOrder = "ASC",
  page,
  limit,
  searchTerm = "",
}) {
  try {
    let baseQuery = `
      FROM products
      JOIN brands ON products.brand_id = brands.id
      WHERE products.price BETWEEN $1 AND $2
    `;

    const params = [minPrice, maxPrice];
    let paramIndex = params.length;

    // Optional category filter
    if (categoryIds && categoryIds.length > 0) {
      const placeholders = categoryIds.map(() => `$${++paramIndex}`).join(", ");
      baseQuery += ` AND products.category_id IN (${placeholders})`;
      params.push(...categoryIds);
    }

    // Optional brand filter
    if (brandIds && brandIds.length > 0) {
      const placeholders = brandIds.map(() => `$${++paramIndex}`).join(", ");
      baseQuery += ` AND products.brand_id IN (${placeholders})`;
      params.push(...brandIds);
    }

    // Optional stock filter
    if (inStockOnly) {
      baseQuery += ` AND products.stock > 0`;
    }

    // Optional search term
    if (searchTerm.trim() !== "") {
      paramIndex++;
      baseQuery += `
        AND (
          LOWER(products.name) LIKE LOWER($${paramIndex})
          OR LOWER(brands.name) LIKE LOWER($${paramIndex})
        )
      `;
      params.push(`%${searchTerm.trim()}%`);
    }

    // --- Count query ---
    const countQuery = `SELECT COUNT(*) ${baseQuery}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // --- Data query with LIMIT/OFFSET ---
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT 
        brands.name AS brand,
        products.id,
        products.name,
        products.price,
        products.stock,
        products.image_url
      ${baseQuery}
      ORDER BY products.price ${sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"}
      LIMIT ${limit} OFFSET ${offset}
    `;
    const dataResult = await pool.query(dataQuery, params);

    return {
      products: dataResult.rows,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching filtered products:", error);
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
