const bcrypt = require("bcrypt");
const userDatamapper = require("../datamappers/user.datamapper");
const addressDatamapper = require("../datamappers/address.datamapper");

const userController = {
  async getProfile(req, res) {
    try {
      const user = await userDatamapper.getUserWithAddress(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ user });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await userDatamapper.findById(req.user.id);

      if (user.password) {
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(403).json({ message: "Current password incorrect" });
      }

      await userDatamapper.updatePassword(req.user.id, newPassword);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Error updating password" });
    }
  },

  async updateProfile(req, res) {
    try {
      const updatedUser = await userDatamapper.updateUserAndAddress(req.user.id, req.body);
      res.json({ success: true, user: updatedUser });
    } catch (err) {
      res.status(500).json({ error: "Failed updating profile" });
    }
  },

  async createAddress(req, res) {
    try {
      const { street, city, state, postalCode, country } = req.body
      const userAddress = await addressDatamapper.registerAddress(req.user.id, street, city, state, postalCode, country);
      res.json({ success: true, address: userAddress});
    } catch (err) {
      res.status(500).json({ error: "Failed creating address" });
    }
  }
};

module.exports = userController;
