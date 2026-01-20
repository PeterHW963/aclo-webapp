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
            "-adminRemarks",
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

// @route POST /api/orders/from-checkout/:checkoutId
// @desc Create order from a checkout
// @access Private
router.post("/from-checkout/:checkoutId", protect, async (req, res) => {
    try {
        const { checkoutId } = req.params;

        const checkout = await Checkout.findById(checkoutId);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        const orderItems = checkout.checkoutItems.map((item) => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            name: item.name,
            image: item.image,
            price: item.price,
            options: item.options || {},
            quantity: item.quantity,
            weight: item.weight || 0,
        }));

        const createdOrder = await Order.create({
            user: checkout.user,
            checkout: checkout._id,

            orderItems,
            shippingDetails: checkout.shippingDetails,

            shippingCost: checkout.shippingCost || 0,
            shippingMethod: checkout.shippingMethod || "N/A",
            shippingCourier: checkout.shippingCourier || "N/A",
            shippingDuration: checkout.shippingDuration || "N/A",

            paymentMethod: checkout.paymentMethod,
            paymentProof: checkout.paymentProof,
            noteToSeller: checkout.noteToSeller || "",

            totalPrice: checkout.totalPrice,
            isPaid: checkout.isPaid,
            paidAt: checkout.paidAt,
        });

        res.status(201).json(createdOrder);
    } catch (err) {
        console.error("createOrder from checkout error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});
