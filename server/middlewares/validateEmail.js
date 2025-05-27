const { body } = require("express-validator");

const validateEmail = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
];

module.exports = validateEmail;
