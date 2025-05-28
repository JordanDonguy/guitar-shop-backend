const pool = require("../db/index");
const { v4: uuidv4 } = require("uuid");

async function getUserByToken(token) {
  try {
    const result = await pool.query(
      "SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()",
      [token],
    );
    return result.rows[0]?.user_id || null;
  } catch (error) {
    console.error("Error finding infos by token:", error);
    throw error;
  }
}

async function createToken(userId) {
  try {
    const token = uuidv4();
    const now = new Date();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    const result = await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id)
            DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at, created_at = NOW()
            RETURNING token
          `,
      [userId, token, expiresAt.toISOString(), now.toISOString()],
    );
    return result.rows[0]?.token || null;
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
}

async function deleteToken(token) {
  try {
    await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [
      token,
    ]);
  } catch (error) {
    console.error("Error deleting token:", error);
    throw error;
  }
}

module.exports = {
  getUserByToken,
  createToken,
  deleteToken,
};
