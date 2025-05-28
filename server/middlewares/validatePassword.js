const { body } = require("express-validator");

const validatePassword = [
  body("token").notEmpty(),
  body("password").isLength({ min: 8 }),
];

module.exports = validatePassword;
