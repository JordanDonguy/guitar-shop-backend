const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

async function getSubscriberByEmail(email) {
  try {
    const result = await pool.query(
      'SELECT * FROM newsletter_subscribers WHERE email = $1',
      [email]
    );
    return result.rows[0];
  } catch (error) {
    console.error('error getting subscriber by email:', error)
    throw error
  }
}

async function subscribeUser(email) {
  try {
    const unsubscribeToken = uuidv4();
    const result = await pool.query(
      `INSERT INTO newsletter_subscribers (email, token)
       VALUES ($1, $2) RETURNING *`,
      [email, unsubscribeToken]
    );
    return result.rows[0];
  } catch (error) {
    console.error('error subscribing user:', error);
    throw error
  }
}

async function unsubscribeByToken(token) {
  try {
    const result = await pool.query(
      'DELETE FROM newsletter_subscribers WHERE token = $1 RETURNING *',
      [token]
    );
    return result.rows[0];
  } catch (error) {
    console.error('error unsubscribing by token:', error);
    throw error
  }
}

async function getSubscriberByToken(token) {
  try {
    const result = await pool.query(
      'SELECT * FROM newsletter_subscribers WHERE token = $1',
      [token]
    );
    return result.rows[0];
  } catch (error) {
    console.error('error getting subscriber by token:', error);
    throw error
  }
}

module.exports = {
  getSubscriberByEmail,
  subscribeUser,
  unsubscribeByToken,
  getSubscriberByToken,
};
