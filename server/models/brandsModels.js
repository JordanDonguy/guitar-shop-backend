const pool = require("../db/index");

async function getAllBrands() {
  try {
    const result = await pool.query(`SELECT * FROM brands`);
    return result.rows;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
}

module.exports = { getAllBrands };
