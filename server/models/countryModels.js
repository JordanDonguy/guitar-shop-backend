const pool = require("../db/index");

async function getAllCountries() {
  try {
    const result = await pool.query(
      "SELECT * FROM countries ORDER BY name ASC",
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
}

module.exports = {
  getAllCountries,
};
