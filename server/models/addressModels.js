const pool = require("../db/index");

// Register a new address
async function registerAddress(
  user_id,
  street,
  city,
  state,
  postal_code,
  country,
) {
  const query = `
        INSERT INTO address (user_id, street, city, state, postal_code, country)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_id, street, city, state, postal_code, country
    `;

  const values = [user_id, street, city, state, postal_code, country];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error registering address:", error);
    throw error;
  }
}

// Find Address ID by user ID
async function getAddressId(user_id) {
  try {
    const result = await pool.query(
      `SELECT id FROM address WHERE user_id = $1`,
      [user_id],
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching address id : ", error);
    throw error;
  }
}

module.exports = {
  registerAddress,
  getAddressId,
};
