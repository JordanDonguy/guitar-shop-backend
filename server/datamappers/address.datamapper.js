const pool = require("../db");
const Address = require("../models/address.model");

const addressDatamapper = {
  async registerAddress(userId, street, city, state, postalCode, country) {
    const query = `
      INSERT INTO address (user_id, street, city, state, postal_code, country)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, street, city, state, postal_code, country
    `;
    const values = [userId, street, city, state, postalCode, country];

    try {
      const result = await pool.query(query, values);
      return new Address(result.rows[0]);
    } catch (error) {
      console.error("Error registering address:", error);
      throw error;
    }
  },

  async findByUserId(userId) {
    try {
      const result = await pool.query(
        `SELECT id, user_id, street, city, state, postal_code, country
         FROM address WHERE user_id = $1`,
        [userId],
      );

      return result.rows[0] ? new Address(result.rows[0]) : null;
    } catch (error) {
      console.error("Error fetching address by userId:", error);
      throw error;
    }
  },
};

module.exports = addressDatamapper;
