const express = require("express");
const Checkout = require("../../models/Checkout");
const { protect, admin } = require("../../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/admin/checkouts/valid-checkouts?page=1&limit=25
// @desc Get all valid checkouts (Admin only)
// @access Private/Admin
router.get("/valid-checkouts", protect, admin, async (req, res) => {
    try {
        const { page = 1, limit = 25 } = req.query;
        const pageNum = Math.max(1, Number(page)); // guard against invalid API call
        const limitNum = Math.max(1, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        const filter = {
            isFinalized: false,
            expiresAt: { $gt: new Date() },
        };

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

module.exports = router;
