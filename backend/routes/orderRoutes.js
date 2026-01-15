const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const mongoose = require("mongoose");

function findOrderByIdOrOrderId(id) {
    if (mongoose.Types.ObjectId.isValid(id)) return Order.findById(id);
    return Order.findOne({ orderId: id });
}

const router = express.Router();

// @route GET /api/orders/my-orders
// @desc Get logged in user's orders
// @access Private
router.get("/my-orders", protect, async (req, res) => {
    try {
        // Find orders for the authenticated user
        const orders = await Order.find({ user: req.user._id }).sort({
            createdAt: -1,
        }); // most recent orders first
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route GET /api/orders/:id
// @desc Get order details by ID
// @access Private
router.get("/:id", protect, async (req, res) => {
    try {
        const order = await findOrderByIdOrOrderId(req.params.id).select(
            "-adminRemarks"
        );
        if (!order) {
            res.status(404).json({ message: "Order Not Found" });
        }

        // Return the full order details
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
