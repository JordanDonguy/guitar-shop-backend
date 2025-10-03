const express = require("express");
const router = express.Router();
const validateEmail = require("../middlewares/validateEmail");
const handleValidation = require("../middlewares/handleValidation");
const newsletterController = require("../controllers/newsletter.controller");

router.post("/subscribe", validateEmail, handleValidation, newsletterController.subscribe);
router.get("/unsubscribe/:token", newsletterController.unsubscribe);

module.exports = router;
