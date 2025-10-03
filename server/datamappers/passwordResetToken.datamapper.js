const pool = require("../db");
const { v4: uuidv4 } = require("uuid");
const PasswordResetToken = require("../models/passwordResetToken.model");

const passwordResetTokenDatamapper = {
  async getUserByToken(token) {
    try {
      console.log(token);
      const result = await pool.query(
        `SELECT user_id, token, expires_at, created_at
         FROM password_reset_tokens
         WHERE token = $1 AND expires_at > NOW()`,
        [token],
      );

      return result.rows[0] ? new PasswordResetToken(result.rows[0]) : null;
    } catch (error) {
      console.error("Error finding token:", error);
      throw error;
    }
  },

  async createToken(userId) {
    try {
      const token = uuidv4();

      const result = await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
       VALUES ($1, $2, NOW() + interval '1 hour', NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET token = EXCLUDED.token, expires_at = NOW() + interval '1 hour', created_at = NOW()
       RETURNING token`,
        [userId, token],
      );

      return result.rows[0] ? result.rows[0].token : null;
    } catch (error) {
      console.error("Error creating token:", error);
      throw error;
    }
  },

  async deleteToken(token) {
    try {
      await pool.query(`DELETE FROM password_reset_tokens WHERE token = $1`, [
        token,
      ]);
    } catch (error) {
      console.error("Error deleting token:", error);
      throw error;
    }
  },
};

module.exports = passwordResetTokenDatamapper;
