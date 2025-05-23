const { body } = require("express-validator");

const validateAddress = [
  body("street").trim().notEmpty().withMessage("Street address is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("postal_code")
    .trim()
    .notEmpty()
    .withMessage("Postal code is required")
    .isPostalCode("any")
    .withMessage("Invalid postal code"),
  body("country").trim().notEmpty().withMessage("Country is required"),
];

module.exports = validateAddress;
