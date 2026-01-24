const express = require("express");
const mongoose = require("mongoose");
const Checkout = require("../../models/Checkout");
const { protect, admin } = require("../../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/admin/checkouts/incomplete-checkouts?page=1&limit=25
// @desc Get all valid checkouts (Admin only)
// @access Private/Admin
router.get("/incomplete-checkouts", protect, admin, async (req, res) => {
    try {
        const { page = 1, limit = 25, status = "valid" } = req.query;
        const pageNum = Math.max(1, Number(page)); // guard against invalid API call
        const limitNum = Math.max(1, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        const now = new Date();

        let filter = {};
        if (status === "valid") {
            filter = { isFinalized: false, expiresAt: { $gt: now } };
        } else if (status === "expired") {
            filter = { isFinalized: false, expiresAt: { $lte: now } };
        } else {
            return res.status(400).json({ message: "Invalid status" });
        }

        const [checkouts, total] = await Promise.all([
            Checkout.find(filter)
                .populate("user", "name email")
                .sort({ createdAt: -1 }) // optional, but usually nice
                .skip(skip)
                .limit(limitNum),
            Checkout.countDocuments(filter),
        ]);
        res.json({
            checkouts,
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @router GET /api/admin/checkouts/:id
// @desc Fetch checkout info by id
// @access Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid checkout id" });
        }

        const checkout = await Checkout.findById(id).populate(
            "user",
            "name email"
        );

        if (!checkout) {
            return res.status(404).json({ message: "Checkout Not Found" });
        }

        // respond with exactly what frontend needs
        return res.status(200).json(checkout);
    } catch (err) {
        console.error("GET /api/checkout/:id error:", err);
        return res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
