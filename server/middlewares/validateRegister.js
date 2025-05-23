const { body } = require("express-validator");

const validateRegister = [
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
];

module.exports = validateRegister;
