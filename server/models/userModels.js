const pool = require('../db/index');
const bcrypt = require('bcrypt');

async function registerUser({ email, password, first_name, last_name, phone_number }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (email, password, first_name, last_name, phone_number)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, first_name, last_name, phone_number, created_at;
  `;

  const values = [email, hashedPassword, first_name, last_name, phone_number];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

async function findUserByEmail(email) {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  if (!result.rows[0]) return null;
  return result.rows[0];
}

async function findUserById(id) {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  if (!result.rows[0]) return null;
  return result.rows[0];
}

module.exports = {
  registerUser,
  findUserByEmail,
  findUserById
};