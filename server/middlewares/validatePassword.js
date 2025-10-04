const { body } = require("express-validator");

const validatePassword = [
  body("password").isLength({ min: 8 }),
];

module.exports = validatePassword;
