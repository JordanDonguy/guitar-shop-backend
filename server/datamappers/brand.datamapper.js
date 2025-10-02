const pool = require("../db/index");
const Brand = require("../models/brand.model");

const brandDatamapper = {
  async findAll() {
    try {
      const result = await pool.query("SELECT * FROM brands");
      return result.rows.map(row => new Brand(row));
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  },
};

module.exports = brandDatamapper;
