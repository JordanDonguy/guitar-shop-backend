const { body } = require("express-validator");

const validateEmail = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail({
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    gmail_convert_googlemaildotcom: false,
    all_lowercase: true,
  }),
];

module.exports = validateEmail;
