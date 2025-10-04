const { body } = require("express-validator");

const validateUpdateUser = [
  // User fields
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      gmail_convert_googlemaildotcom: false,
      all_lowercase: true,
    }),
  body("first_name").optional({ checkFalsy: true }).trim(),
  body("last_name").optional({ checkFalsy: true }).trim(),
  body("phone_number")
    .optional({ checkFalsy: true })
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),

  // Address fields (nested)
  body("address.street")
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage("Street address is required"),
  body("address.city")
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("address.state")
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage("State is required"),
  body("address.postalCode")
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage("Postal code is required")
    .isPostalCode("any")
    .withMessage("Invalid postal code"),
  body("address.country")
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage("Country is required"),
];

module.exports = validateUpdateUser;
