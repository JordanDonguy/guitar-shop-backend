const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

module.exports = router;
