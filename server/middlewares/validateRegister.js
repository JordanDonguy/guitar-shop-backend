const { body } = require("express-validator");

const validateRegister = [
  
  // User infos validations
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("first_name").trim().notEmpty().withMessage("First name is required"),
  body("last_name").trim().notEmpty().withMessage("Last name is required"),
  body("phone_number")
    .optional({ checkFalsy: true })
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),

  // Address validations
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

module.exports = validateRegister;
