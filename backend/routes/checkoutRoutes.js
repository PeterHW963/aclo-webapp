const express = require("express");
const mongoose = require("mongoose");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const { sendEmail } = require("../utils/emailService");
const {
    generateCartSnapshotHash,
} = require("../utils/generateCartSnapshotHash");
const { CHECKOUT_EXPIRATION_TIME } = require("../config/checkoutConfig");

const router = express.Router();

// @route POST /api/checkout
// @desc Get or create an active checkout for a cart
// @access Private
router.post("/", protect, async (req, res) => {
    try {
        const {
            cartId,
            shippingDetails,
            paymentMethod,
            totalPrice,
            shippingCost,
            shippingMethod,
            shippingCourier,
            shippingDuration,
            noteToSeller,
        } = req.body;
        if (!cartId) {
            return res.status(400).json({ message: "cartId is required" });
        }
        const cart = await Cart.findOne({ _id: cartId, user: req.user._id });
        if (!cart || cart.products.length === 0) {
            return res
                .status(400)
                .json({ message: "Cart is empty or not found" });
        }
        const cartSnapshotHash = generateCartSnapshotHash(cart.products);

        // check for existing checkout with same cart (id & contents) and same user
        const existingCheckout = await Checkout.findOne({
            cartId: cartId,
            user: req.user._id,
            cartSnapshotHash: cartSnapshotHash,
            isFinalized: false,
            expiresAt: { $gt: new Date() },
        });

        if (existingCheckout) {
            return res.status(200).json(existingCheckout);
        }

        if (!shippingDetails?.postalCode) {
            return res
                .status(400)
                .json({ message: "Shipping details missing" });
        }

        const checkoutItemsWithWeight = [];

        for (const item of cart.products) {
            const { productId, productVariantId, options, quantity } = item;
            if (
                !productId ||
                !productVariantId ||
                !quantity ||
                !options ||
                quantity < 1
            ) {
                return res
                    .status(400)
                    .json({ message: "Invalid checkout item payload" });
            }

            const product = await Product.findById(item.productId);
            if (!product)
                return res.status(404).json({ message: "Product Not Found" });

            const pv = await ProductVariant.findOne({
                _id: productVariantId,
                productId: productId,
            });
            if (!pv)
                return res
                    .status(404)
                    .json({ message: "ProductVariant Not Found" });

            checkoutItemsWithWeight.push({
                productId: item.productId,
                productVariantId: item.productVariantId,
                name: item.name,
                image: item.image,
                price: item.price,
                options: item.options || {},
                quantity: item.quantity,

                weight: product.weight || 0,
            });
        }

        const createdCheckout = await Checkout.create({
            user: req.user._id,
            cartId,
            cartSnapshotHash,
            checkoutItems: checkoutItemsWithWeight,
            shippingDetails: {
                ...shippingDetails,
                email: req.user.email, // add email
            },
            paymentMethod,
            totalPrice,
            noteToSeller: noteToSeller || "",

            shippingCost: shippingCost || 0,
            shippingMethod: shippingMethod || "",
            shippingCourier: shippingCourier || "",
            shippingDuration: shippingDuration || "",

            isFinalized: false,
            finalizedAt: new Date(),
            expiresAt: new Date(Date.now() + CHECKOUT_EXPIRATION_TIME),
            isExpired: false,
        });

        res.status(201).json(createdCheckout);
    } catch (err) {
        console.error("createCheckout error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// @router POST /api/checkout/:id/submit-proof
// @desc submit payment proof and create (pending) order
// @access Private
router.post("/:id/submit-proof", protect, async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { publicId, note } = req.body;
        if (!publicId) {
            return res
                .status(400)
                .json({ message: "Payment proof is required" });
        }

        let createdOrder;

        await session.withTransaction(async () => {
            const checkout = await Checkout.findById(req.params.id).session(
                session,
            );
            if (!checkout) {
                return res.status(404).json({ message: "checkout not found" });
            }
            if (checkout.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Not allowed" });
            }
            if (checkout.expiresAt < new Date()) {
                return res.status(400).json({
                    message: "checkout expired.",
                });
            }
            // set proof on checkout
            checkout.paymentProof = {
                publicId,
                uploadedAt: new Date(),
                status: "pending",
            };
            checkout.noteToSeller = note ?? "";

            createdOrder = await Order.create(
                [
                    {
                        user: checkout.user,
                        checkout: checkout._id,
                        orderItems: checkout.checkoutItems,
                        shippingDetails: checkout.shippingDetails,
                        shippingCost: checkout.shippingCost,
                        shippingMethod: checkout.shippingMethod,
                        shippingCourier: checkout.shippingCourier,
                        shippingDuration: checkout.shippingDuration,

                        paymentMethod: checkout.paymentMethod,
                        paymentProof: checkout.paymentProof,
                        noteToSeller: checkout.noteToSeller,
                        totalPrice: checkout.totalPrice,
                        status: "pending",
                    },
                ],
                { session },
            ).then((r) => r[0]);

            checkout.isFinalized = true;
            checkout.finalizedAt = new Date();
            await checkout.save({ session });

            await Cart.findOneAndDelete({ user: checkout.user }).session(
                session,
            );
        });
        if (createdOrder && req.user.email) {
            sendEmail(
                req.user.email,
                `Order Confirmation #${createdOrder.orderId}`,
                `Your order with Order ID #${createdOrder.orderId} has been placed successfully.`,
            );
        }
        if (res.headersSent) return;
        return res.status(200).json(createdOrder);
    } catch (err) {
        console.error("Error updating payment proof: ", err);
        return res.status(500).json({ message: "Server Error" });
    } finally {
        session.endSession();
    }
});

// @router POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment completion
// @access Private
// router.post("/:id/finalize", protect, async (req, res) => {
//     const session = await mongoose.startSession();
//     try {
//         let finalOrder;

//         await session.withTransaction(async () => {
//             const checkout = await Checkout.findById(req.params.id).session(
//                 session
//             );

//             if (!checkout) {
//                 return res.status(404).json({ message: "Checkout Not Found" });
//             }

//             if (checkout.user.toString() !== req.user._id.toString()) {
//                 res.status(403).json({ message: "Not allowed" });
//                 return;
//             }
//             if (!checkout.isPaid) {
//                 res.status(400).json({ message: "Checkout is Not Paid" });
//                 return;
//             }

//             if (checkout.isFinalized) {
//                 res.status(400).json({ message: "Checkout Already Finalized" });
//                 return;
//             }

//             // decrement stock - not needed for now
//             for (const item of checkout.checkoutItems) {
//                 const r = await ProductVariant.updateOne(
//                     {
//                         _id: item.productVariantId,
//                         productId: item.productId,
//                         countInStock: { $gte: item.quantity },
//                     },
//                     { $inc: { countInStock: -item.quantity } },
//                     { session }
//                 );

//                 if ((r.modifiedCount ?? 0) !== 1) {
//                     // fail if insufficient stock or variant not found
//                     res.status(400).json({
//                         message: "Insufficient stock while finalizing.",
//                         productVariantId: item.productVariantId,
//                     });
//                     return;
//                 }
//             }

//             // Create final order
//             finalOrder = await Order.create(
//                 [
//                     {
//                         user: checkout.user,
//                         orderItems: checkout.checkoutItems,
//                         shippingDetails: checkout.shippingDetails,
//                         paymentMethod: checkout.paymentMethod,
//                         totalPrice: checkout.totalPrice,
//                         isPaid: true,
//                         paidAt: checkout.paidAt,
//                         isDelivered: false,
//                         paymentStatus: "paid",
//                         paymentDetails: checkout.paymentDetails,
//                     },
//                 ],
//                 { session }
//             ).then((r) => r[0]);

//             // Mark checkout finalized
//             checkout.isFinalized = true;
//             checkout.finalizedAt = Date.now();
//             await checkout.save({ session });

//             // Delete user cart
//             await Cart.findOneAndDelete({ user: checkout.user }).session(
//                 session
//             );
//         });
//         if (res.headersSent) return;
//         res.status(201).json(finalOrder);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server Error" });
//     } finally {
//         session.endSession();
//     }
// });

// @router GET /api/checkout/:id
// @desc Fetch checkout info by id
// @access Private
router.get("/:id", protect, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid checkout id" });
        }

        const checkout = await Checkout.findById(id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout Not Found" });
        }

        // ownership check
        if (checkout.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not allowed" });
        }

        // respond with exactly what frontend needs
        return res.status(200).json(checkout);
    } catch (err) {
        console.error("GET /api/checkout/:id error:", err);
        return res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
