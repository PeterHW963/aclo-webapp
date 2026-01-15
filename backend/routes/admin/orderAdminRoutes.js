const express = require("express");
const Order = require("../../models/Order");
const { protect, admin } = require("../../middleware/authMiddleware");
const {
    generateShippingLabelPDF,
} = require("../../utils/generateShippingLabel");

const mongoose = require("mongoose");

function findOrderByIdOrOrderId(id) {
    if (mongoose.Types.ObjectId.isValid(id)) return Order.findById(id);
    return Order.findOne({ orderId: id });
}

const router = express.Router();

// @route GET /api/admin/orders?category=pending_action&page=1&limit=25
// @desc Get all orders (Admin only)
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
    // try {
    //     const orders = await Order.find({}).populate("user", "name email");
    //     res.json(orders);
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: "Server Error" });
    // }
    try {
        const { category = "all", status, page = 1, limit = 25 } = req.query;
        const categoryMap = {
            pending_action: ["pending", "cancelling", "processing"],
            ongoing: ["shipping"],
            resolved: ["rejected", "delivered", "cancelled"],
            failed: ["returned", "refunded", "exchanged"],
            all: null,
        };

        const filter = {};

        if (status) {
            const statuses = String(status)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            filter.status = { $in: statuses };
        } else if (category !== "all" && categoryMap[category]) {
            filter.status = { $in: categoryMap[category] };
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate("user", "name email")
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Order.countDocuments(filter),
        ]);

        res.json({
            orders,
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        });

        // const orders = await Order.find({}).populate("user", "name email");
        // res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route GET /api/admin/orders/:id
// @desc Get order details by ID
// @access Private
router.get("/:id", protect, admin, async (req, res) => {
    try {
        const order = await findOrderByIdOrOrderId(req.params.id);
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

// @route PUT /api/admin/orders/:id/remarks
// @desc Update admin remarks
// @access Private/Admin
router.put("/:id/remarks", protect, admin, async (req, res) => {
    try {
        const { adminRemarks } = req.body;

        const order = await findOrderByIdOrOrderId(req.params.id);
        if (!order) return res.status(404).json({ message: "Order Not Found" });

        order.adminRemarks = adminRemarks ?? order.adminRemarks;

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route PUT /api/admin/orders/:id/trackingLink
// @desc Update order tracking Id
// @access Private/Admin
router.put("/:id/trackingLink", protect, admin, async (req, res) => {
    try {
        const { trackingLink } = req.body;

        const order = await findOrderByIdOrOrderId(req.params.id);
        if (!order) return res.status(404).json({ message: "Order Not Found" });

        order.trackingLink = trackingLink ?? order.trackingLink;

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route PUT /api/admin/orders/:id
// @desc Update order status
// @access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const order = await findOrderByIdOrOrderId(req.params.id).populate(
            "user",
            "name"
        );
        if (order) {
            order.status = req.body.status || order.status;
            order.isDelivered =
                req.body.status === "Delivered" ? true : order.isDelivered;
            order.deliveredAt =
                req.body.status === "Delivered"
                    ? Date.now()
                    : order.deliveredAt;

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: "Order Not Found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json("Server Error");
    }
});

// @route DELETE /api/admin/orders/:id
// @desc Delete an order
// @access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const order = await findOrderByIdOrOrderId(req.params.id);
        if (order) {
            await order.deleteOne();
            res.json({ message: "Order Removed" });
        } else {
            res.status(404).json({ message: "Order Not Found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route GET /api/admin/orders/:id/shipping-label
// @desc Generate shipping label for an order (in PDF)
// @access Private/Admin
router.get("/:id/shipping-label", protect, admin, async (req, res) => {
    try {
        const order = await findOrderByIdOrOrderId(req.params.id)
            .populate("user", "name email")
            .populate("orderItems.productVariantId");

        if (!order) {
            return res.status(404).json({ message: "Order Not Found" });
        }

        const pdfBuffer = await generateShippingLabelPDF(order);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `inline; filename=shipping-label-${order.orderId}.pdf`
        );
        res.setHeader("Content-Length", pdfBuffer.length);

        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating shipping label:", error);
        res.status(500).json({ message: "Failed to generate shipping label" });
    }
});

module.exports = router;
