const pool = require("../db");
const { v4: uuidv4 } = require("uuid");
const NewsletterSubscriber = require("../models/newsletter.model");

const newsletterDatamapper = {
  async getSubscriberByEmail(email) {
    const result = await pool.query(
      "SELECT * FROM newsletter_subscribers WHERE email = $1",
      [email],
    );
    return result.rows[0] ? new NewsletterSubscriber(result.rows[0]) : null;
  },

  async getSubscriberByToken(token) {
    const result = await pool.query(
      "SELECT * FROM newsletter_subscribers WHERE token = $1",
      [token],
    );
    return result.rows[0] ? new NewsletterSubscriber(result.rows[0]) : null;
  },

  async subscribeUser(email) {
    const token = uuidv4();
    const result = await pool.query(
      "INSERT INTO newsletter_subscribers (email, token) VALUES ($1, $2) RETURNING *",
      [email, token],
    );
    return new NewsletterSubscriber(result.rows[0]);
  },

  async unsubscribeByToken(token) {
    const result = await pool.query(
      "DELETE FROM newsletter_subscribers WHERE token = $1 RETURNING *",
      [token],
    );
    return result.rows[0] ? new NewsletterSubscriber(result.rows[0]) : null;
  },
};

module.exports = newsletterDatamapper;
