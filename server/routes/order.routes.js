const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../middlewares/checkAuth");
const orderController = require("../controllers/order.controller");

router.get("/", checkAuthenticated, orderController.getOrdersByUser);
router.get("/items", checkAuthenticated, orderController.getItemsByOrder);

module.exports = router;
