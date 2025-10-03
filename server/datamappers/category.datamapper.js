const pool = require("../db");
const Category = require("../models/category.model");

const categoryDatamapper = {
  async findAll() {
    try {
      const result = await pool.query("SELECT * FROM categories");
      return result.rows.map((row) => new Category(row));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
};

module.exports = categoryDatamapper;
