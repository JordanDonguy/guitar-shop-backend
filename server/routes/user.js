const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../middlewares/checkAuth");
const {
  getUserInfosById,
  updateUserAndAddress,
} = require("../models/userModels");
const { getAllCountries } = require("../models/countryModels");

// Get user informations

router.get("/", checkAuthenticated, async (req, res) => {
  try {
    const user = await getUserInfosById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const countries = await getAllCountries();

    res.json({ user, countries, error: null });
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

module.exports = router;
