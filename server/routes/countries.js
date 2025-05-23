const express = require("express");
const router = express.Router();
const { getAllCountries } = require("../models/countryModels");

router.get("/", async (req, res) => {
  try {
    const countries = await getAllCountries();
    return res.status(200).json({ countries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error fetching countries" });
  }
});

module.exports = router;
