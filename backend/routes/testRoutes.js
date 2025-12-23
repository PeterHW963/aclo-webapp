const express = require("express");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();

// @route POST /api/test/email
// @desc Send a test email
// @access Public
router.post("/email", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        await sendEmail({
            to: email,
            subject: "Frontend Test Email",
            text: "This email was triggered from the frontend button!",
            html: "<h1>It Works!</h1><p>This email was triggered from the <strong>frontend button</strong>.</p>",
        });

        res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("Email send error:", error);
        res.status(500).json({ message: "Email could not be sent" });
    }
});

module.exports = router;