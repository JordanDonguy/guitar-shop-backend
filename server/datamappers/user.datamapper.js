const pool = require("../db/index");
const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");

const userDatamapper = {
  async findById(id) {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  },

  async findByEmail(email) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  },

  async findByGoogleId(googleId) {
    const result = await pool.query(`SELECT * FROM users WHERE google_id = $1`, [googleId]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  },

  async createGoogleUser({ googleId, email, first_name, last_name }) {
    const result = await pool.query(
      `INSERT INTO users (google_id, email, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [googleId, email, first_name, last_name]
    );
    return result.rows[0] ? new User(result.rows[0]).safe() : null;
  },

  async linkGoogleIdToUser(userId, googleId) {
    await pool.query(`UPDATE users SET google_id = $1 WHERE id = $2`, [googleId, userId]);
  },

  async register({ email, password, first_name, last_name, phone_number }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone_number)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [email, hashedPassword, first_name, last_name, phone_number]
    );
    return new User(result.rows[0]).safe();
  },

  async updatePassword(userId, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(`UPDATE users SET password=$1 WHERE id=$2`, [hashedPassword, userId]);
  },

  async getUserWithAddress(userId) {
    const result = await pool.query(
      `SELECT 
         users.*, 
         address.street, address.city, address.state, address.postal_code, address.country
       FROM users
       LEFT JOIN address ON users.id = address.user_id
       WHERE users.id = $1`,
      [userId]
    );

    if (!result.rows[0]) return null;

    const userData = { ...result.rows[0] };
    const addressData = {
      street: userData.street,
      city: userData.city,
      state: userData.state,
      postal_code: userData.postal_code,
      country: userData.country,
    };
    userData.address = addressData.street ? addressData : null;
    return new User(userData).safe();
  },

  async updateUserAndAddress(id, data) {
    try {
      await pool.query("BEGIN");

      const userFields = ["first_name", "last_name", "email", "phone_number"];
      for (const field of userFields) {
        if (field in data) {
          await pool.query(`UPDATE users SET ${field} = $1 WHERE id = $2`, [data[field], id]);
        }
      }

      const addressResult = await pool.query(`SELECT id FROM address WHERE user_id = $1`, [id]);
      if (addressResult.rows.length > 0) {
        const addressFields = ["street", "city", "state", "postal_code", "country"];
        for (const field of addressFields) {
          if (field in data) {
            await pool.query(`UPDATE address SET ${field} = $1 WHERE user_id = $2`, [data[field], id]);
          }
        }
      }

      await pool.query("COMMIT");

      return await this.getUserWithAddress(id);
    } catch (err) {
      await pool.query("ROLLBACK");
      console.error("Error updating user and address infos:", err);
      throw err;
    }
  },
};

module.exports = userDatamapper;

