const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../middlewares/checkAuth");
const userController = require("../controllers/user.controller");
const validateAddress = require("../middlewares/validateAddress");
const validateUpdateUser = require("../middlewares/validateUpdateUser");
const validatePassword = require("../middlewares/validatePassword");
const validateUpdatePassword = require("../middlewares/validateUpdatePassword");
const handleValidation = require("../middlewares/handleValidation");

// Get user profile
router.get("/", checkAuthenticated, userController.getProfile);

// Create address
router.post("/address",
  checkAuthenticated,
  validateAddress,
  handleValidation,
  userController.createAddress
);

// Create password
router.post("/password",
  checkAuthenticated,
  validatePassword,
  handleValidation,
  userController.createPassword
)

// Update password
router.patch("/password",
  checkAuthenticated,
  validateUpdatePassword,
  handleValidation,
  userController.updatePassword
);

// Update user profile
router.patch("/",
  checkAuthenticated,
  validateUpdateUser,
  handleValidation,
  userController.updateProfile
);

module.exports = router;
