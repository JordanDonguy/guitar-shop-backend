const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { checkAuthenticated } = require("../middlewares/checkAuth");
const {
  getUserInfosById,
  hasPassword,
  updatePassword,
  updateUserAndAddress,
  findUserById,
} = require("../models/userModels");
const { getAllCountries } = require("../models/countryModels");
const { registerAddress, getAddressId } = require("../models/addressModels");
const validateAddress = require("../middlewares/validateAddress");
const handleValidation = require("../middlewares/handleValidation");

router.get("/", checkAuthenticated, async (req, res) => {
  try {
    const user = await getUserInfosById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const hasPwd = await hasPassword(req.user.id);

    res.json({ user, hasPwd, error: null });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:id", checkAuthenticated, async (req, res) => {
  try {
    const requestedId = String(req.params.id);
    const loggedInUserId = String(req.user.id);

    // Deny access if the user is trying to access someone else's data
    if (requestedId !== String(loggedInUserId)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const userInfos = await getUserInfosById(req.params.id);

    if (!userInfos)
      return res.status(404).send({ error: "User informations not found" });
    const countries = await getAllCountries();
    res.render("user-profile.ejs", { user: userInfos, error: null, countries });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/password", checkAuthenticated, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    const { currentPassword, newPassword } = req.body;

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!passwordMatches) {
      return res.status(403).json({ message: "Current password is incorrect" });
    }

    await updatePassword(newPassword, user.id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong while updating your password." });
  }
});

router.post("/password", checkAuthenticated, async (req, res) => {
  try {
    const { newPassword } = req.body;
    await updatePassword(newPassword, req.user.id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong while creating your password." });
  }
});

router.patch("/:id", checkAuthenticated, async (req, res) => {
  try {
    const requestedId = String(req.params.id);
    const loggedInUserId = String(req.user.id);

    if (requestedId !== loggedInUserId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    await updateUserAndAddress(requestedId, req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Something went wrong while updating your profile." });
  }
});

router.post(
  "/address",
  checkAuthenticated,
  validateAddress,
  handleValidation,
  async (req, res) => {
    try {
      const { street, city, state, postal_code, country } = req.body;

      const isAddress = await getAddressId(req.user.id);
      if (isAddress) {
        return res.status(400).json({ error: "User already has an address" });
      }

      await registerAddress(
        req.user.id,
        street,
        city,
        state,
        postal_code,
        country,
      );

      return res.status(201).json({ success: true });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Something went wrong while creating your address." });
    }
  },
);

module.exports = router;
