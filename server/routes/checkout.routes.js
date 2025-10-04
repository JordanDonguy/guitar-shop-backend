const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../middlewares/checkAuth");
const checkoutController = require("../controllers/checkout.controller");

router.post("/", checkAuthenticated, checkoutController.processCheckout);

module.exports = router;
