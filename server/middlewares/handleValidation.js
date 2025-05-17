const { validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("❌ Validation errors:", errors.array());
    return res.status(400).json({
      errors: errors.array().map((err) => ({ field: err.path, msg: err.msg })),
    });
  }
  next();
};

module.exports = handleValidation;
