const express = require("express");
const Subscriber = require("../../models/Subscriber");
const { protect, admin } = require("../../middleware/authMiddleware");
const { sendEmail } = require("../../utils/emailService");

const router = express.Router();

// @route GET /api/admin/subscribers
// @desc Get all subscribers (Admin only)
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
	try {
		const subscribers = await Subscriber.find({}).sort({ subscribedAt: -1 });
		res.json({
			success: true,
			count: subscribers.length,
			subscribers,
		});
	} catch (error) {
		console.error("Error fetching subscribers:", error);
		res.status(500).json({ message: "Server Error" });
	}
});

// @route POST /api/admin/subscribers/email
// @desc Send email to all subscribers (Admin only)
// @access Private/Admin
router.post("/email", protect, admin, async (req, res) => {
	const { subject, text, html } = req.body;

	if (!subject || !text) {
		return res.status(400).json({
			message: "Subject and text are required",
		});
	}

	try {
		const subscribers = await Subscriber.find({});

		if (subscribers.length === 0) {
			return res.status(404).json({
				message: "No subscribers found",
			});
		}

		const emailPromises = subscribers.map((subscriber) =>
			sendEmail(subscriber.email, subject, text, html)
		);

		const results = await Promise.allSettled(emailPromises);

		// Consider successful and failed emails
		const successful = results.filter(
			(result) => result.status === "fulfilled" && result.value.success
		).length;
		const failed = results.length - successful;

		res.json({
			success: true,
			message: `Email sent to subscribers`,
			totalSubscribers: subscribers.length,
			successful,
			failed,
		});
	} catch (error) {
		console.error("Error sending emails to subscribers:", error);
		res.status(500).json({ message: "Server Error" });
	}
});

module.exports = router;
