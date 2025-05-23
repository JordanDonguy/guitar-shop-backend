const pool = require("../db/index");
const bcrypt = require("bcrypt");

async function registerUser({
  email,
  password,
  first_name,
  last_name,
  phone_number,
}) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
        INSERT INTO users (email, password, first_name, last_name, phone_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, phone_number, created_at
      `;

    const values = [email, hashedPassword, first_name, last_name, phone_number];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

async function findUserByEmail(email) {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (!result.rows[0]) return null;
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
}

async function findUserById(id) {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);

    if (!result.rows[0]) return null;
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
}

async function getUserInfosById(id) {
  try {
    const query = `
      SELECT 
        users.id,
        users.email,
        users.first_name,
        users.last_name,
        users.phone_number,
        address.street,
        address.city,
        address.state,
        address.postal_code,
        address.country,
        countries.name AS country_name
      FROM users
      LEFT JOIN address ON users.id = address.user_id
      LEFT JOIN countries ON address.country = countries.code
      WHERE users.id = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error getting user info by ID:", error);
    throw error;
  }
}

async function updateUserAndAddress(id, data) {
  try {
    // User update
    const userFields = ["first_name", "last_name", "email", "phone_number"];
    let userUpdates = [];
    let userValues = [];

    // Build user update query
    userFields.forEach((field) => {
      if (data[field]) {
        userValues.push(data[field]);
        userUpdates.push(`${field} = $${userValues.length}`);
      }
    });

    if (userUpdates.length > 0) {
      userValues.push(id); // WHERE id = $n
      userUpdates = userUpdates.join(", ");
      await pool.query(
        `UPDATE users SET ${userUpdates} WHERE id = $${userValues.length}`,
        userValues,
      );
    }

    // Address update
    const isAddress = pool.query(`SELECT id FROM address WHERE user_id = $1`, [
      id,
    ]);

    if (isAddress) {
      const addressFields = [
        "street",
        "city",
        "state",
        "postal_code",
        "country",
      ];
      let addressUpdates = [];
      let addressValues = [];

      // Build address update query
      addressFields.forEach((field) => {
        if (data[field]) {
          addressValues.push(data[field]);
          addressUpdates.push(`${field} = $${addressValues.length}`);
        }
      });

      if (addressUpdates.length > 0) {
        addressValues.push(id); // WHERE user_id = $n
        addressUpdates = addressUpdates.join(", ");
        await pool.query(
          `UPDATE address SET ${addressUpdates} WHERE user_id = $${addressValues.length}`,
          addressValues,
        );
      }
    }

    return await getUserInfosById(id);
  } catch (error) {
    console.error("Error updating user and address infos:", error);
    throw error;
  }
}

module.exports = {
  registerUser,
  findUserByEmail,
  findUserById,
  getUserInfosById,
  updateUserAndAddress,
};
