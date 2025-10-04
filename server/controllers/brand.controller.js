const brandDatamapper = require("../datamappers/brand.datamapper");

const brandController = {
  async getAllBrands(req, res) {
    try {
      const brands = await brandDatamapper.findAll();
      res.status(200).json({ brands });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching brands" });
    }
  },
};

module.exports = brandController;
