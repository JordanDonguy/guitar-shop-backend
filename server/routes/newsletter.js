const express = require("express");
const router = express.Router();
const validateEmail = require("../middlewares/validateEmail");
const handleValidation = require("../middlewares/handleValidation");
const {
  getSubscriberByEmail,
  subscribeUser,
  unsubscribeByToken,
} = require("../models/newsletterModels");
const transporter = require("../utils/emailServices");
const getNewsletterHtml = require("../utils/newsletterTemplate");

router.post("/subscribe", validateEmail, handleValidation, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const existing = await getSubscriberByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already subscribed" });
    }

    const newSubscriber = await subscribeUser(email);
    const unsubscribeUrl = `${process.env.SERVER_ORIGIN}/newsletter/unsubscribe/${newSubscriber.token}`;
    const html = getNewsletterHtml(unsubscribeUrl);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: newSubscriber.email,
      replyTo: process.env.GMAIL_USER,
      subject: "Subscribed to Guitar-shop newsletter",
      text: `Welcome to Guitar Shop!
              Thanks for subscribing to our newsletter. Expect occasional updates about new guitars, exclusive deals, and playing tips.
              Visit us: ${process.env.CLIENT_ORIGIN}
              If you didn’t subscribe, you can unsubscribe here:
              ${unsubscribeUrl}
              — The Guitar Shop Team
            `,
      html,
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/unsubscribe/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const unsubscribed = await unsubscribeByToken(token);
    if (!unsubscribed) {
      return res.status(404).send("Invalid or expired unsubscribe token");
    }
    res.redirect(`${process.env.CLIENT_ORIGIN}/unsubscribed`);
  } catch (err) {
    console.error("Unsubscribe error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
