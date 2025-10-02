const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { checkAuthenticated } = require("../middlewares/checkAuth");

router.get("/", checkAuthenticated, cartController.getCart);
router.post("/add", checkAuthenticated, cartController.addItem);
router.post("/updateQuantity", checkAuthenticated, cartController.updateQuantity);
router.post("/saveTemporaryCart", cartController.saveTemporaryCart);

module.exports = router;
