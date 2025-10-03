const { body } = require("express-validator");

const validatePasswordAndToken = [
  body("token").notEmpty(),
  body("password").isLength({ min: 8 }),
];

module.exports = validatePasswordAndToken;
