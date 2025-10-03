const pool = require("../db/index");
const Country = require("../models/country.model.js");

const countryDatamapper = {
  async findAll() {
    try {
      const result = await pool.query(
        "SELECT * FROM countries ORDER BY name ASC",
      );
      return result.rows.map((row) => new Country(row));
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw error;
    }
  },
};

module.exports = countryDatamapper;
