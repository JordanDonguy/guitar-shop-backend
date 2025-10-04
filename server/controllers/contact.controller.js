const transporter = require("../utils/emailServices");

const contactController = {
  async sendMessage(req, res) {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    try {
      await transporter.sendMail({
        from: email,
        to: process.env.GMAIL_USER,
        subject: `Contact Form Submission from ${name}`,
        text: message,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong><br/>${message}</p>`,
      });

      res.status(200).json({ message: "Email sent successfully." });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email." });
    }
  },
};

module.exports = contactController;
