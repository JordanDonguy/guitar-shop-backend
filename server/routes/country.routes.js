const express = require("express");
const router = express.Router();
const countryController = require("../controllers/country.controller.js");

// route only delegates
router.get("/", countryController.getAllCountries);

module.exports = router;
