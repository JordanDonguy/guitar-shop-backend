const { body } = require("express-validator");

const validateUpdatePassword = [
  body("currentPassword").isLength({ min: 8 }),
  body("newPassword").isLength({ min: 8 }),
];

module.exports = validateUpdatePassword;
