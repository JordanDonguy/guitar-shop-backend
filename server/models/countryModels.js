const pool = require('../db/index');

async function getAllCountries() {
    const result = await pool.query('SELECT * FROM countries ORDER BY name ASC');
    return result.rows;
};

module.exports = {
    getAllCountries
}