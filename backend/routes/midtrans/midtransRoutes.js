const express = require("express");
const midtransClient = require("midtrans-client");

const Checkout = require("../../models/Checkout");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

const snap = new midtransClient.Snap({
    isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// @route POST /api/payments/midtrans/token
// @desc Create a midtrans payment token
// @access Private
router.post("/token", protect, async (req, res) => {
    try {
        const { checkoutId } = req.body;
        if (!checkoutId)
            return res.status(400).json({ message: "checkoutId required" });

        const checkout = await Checkout.findById(checkoutId);
        if (!checkout)
            return res.status(404).json({ message: "Checkout Not Found" });

        // ownership check
        if (checkout.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not allowed" });
        }

        if (checkout.isFinalized)
            return res
                .status(400)
                .json({ message: "Checkout already finalized" });
        if (checkout.checkoutItems.length <= 0)
            return res.status(400).json({ message: "No items to checkout" });

        // reuse token if we already created one and it's still pending
        const midtrans = checkout.paymentDetails?.midtrans;
        if (
            checkout.paymentMethod === "Midtrans" &&
            checkout.paymentStatus === "pending" &&
            midtrans?.token
        ) {
            return res.json({
                token: midtrans.token,
                redirect_url: midtrans.redirectUrl,
                reused: true,
            });
        }

        const orderId = checkout.orderId;
        if (!orderId)
            return res.status(400).json({ message: "Missing orderId" });
        const item_details = checkout.checkoutItems.map((item) => ({
            id: String(item.productVariantId),
            price: Number(item.price),
            quantity: Number(item.quantity),
            name: String(item.name).slice(0, 50),
        }));

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: Number(checkout.totalPrice),
            },
            item_details,
            customer_details: {
                first_name: String(checkout.shippingDetails.name).slice(0, 50),
                phone: checkout.shippingDetails.phone,
                shipping_address: {
                    first_name: checkout.shippingDetails.name,
                    address: checkout.shippingDetails.address,
                    city: checkout.shippingDetails.city,
                    postal_code: checkout.shippingDetails.postalCode,
                    phone: checkout.shippingDetails.phone,
                    country_code: "IDN",
                },
            },
        };

        const trx = await snap.createTransaction(parameter);

        // store token in paymentDetails.midtrans

        checkout.paymentDetails = checkout.paymentDetails || {};
        checkout.paymentDetails.midtrans = {
            orderId,
            token: trx.token,
            redirectUrl: trx.redirect_url,
            createdAt: new Date(),
        };
        await checkout.save();
        return res.json({
            token: trx.token,
            redirect_url: trx.redirect_url,
            reused: false,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Midtrans token error" });
    }
});

module.exports = router;
