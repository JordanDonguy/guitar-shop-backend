const countryMapper = require("../datamappers/country.datamapper.js");

const countryController = {
  async getAllCountries(req, res) {
    try {
      const countries = await countryMapper.findAll();
      res.status(200).json({ countries });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching countries" });
    }
  },
};

module.exports = countryController;
