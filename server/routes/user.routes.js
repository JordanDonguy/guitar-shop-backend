const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../middlewares/checkAuth");
const userController = require("../controllers/user.controller");

router.get("/", checkAuthenticated, userController.getProfile);
router.post("/address", checkAuthenticated, userController.createAddress)
router.patch("/password", checkAuthenticated, userController.updatePassword);
router.patch("/", checkAuthenticated, userController.updateProfile);

module.exports = router;
