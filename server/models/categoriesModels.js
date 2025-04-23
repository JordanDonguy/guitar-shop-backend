const pool = require('../db/index');

async function getAllCategories() {
    try {
        const result = await pool.query(`SELECT * FROM categories`);
        return result.rows
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

module.exports = { getAllCategories }