const mongoose = require("mongoose");

const checkoutItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        productVariantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductVariant",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        options: {
            type: Object,
            default: {},
        },
        quantity: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const checkoutSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        cartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cart",
            required: true,
        },
        cartSnapshotHash: {
            type: String,
            required: true,
        },
        checkoutItems: [checkoutItemSchema],
        shippingDetails: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            phone: { type: String, required: true },
        },
        paymentMethod: {
            // might remove if not needed
            type: String,
            required: true,
        },
        paymentProof: {
            publicId: { type: String, default: "" },
            uploadedAt: { type: Date },
            status: {
                // unsure whether to keep this status field because we may want to settle the proof through email/whatsapp instead if it comes to this
                type: String,
                enum: ["none", "pending", "approved", "rejected"],
                default: "none",
            },
        },
        noteToSeller: {
            type: String,
            default: "",
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        shippingCost: {
            type: Number,
            default: 0,
        },
        shippingMethod: {
            type: String,
            required: false,
        },
        shippingCourier: {
            type: String,
            required: false,
        },
        shippingDuration: {
            type: String,
            required: false,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isFinalized: {
            type: Boolean,
            default: false,
        },
        finalizedAt: {
            // timestamp when checkout was finalized
            type: Date,
            required: false,
        },


        // ------ UNUSED FOR NOW ---------
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: {
            // timestamp when payment was made
            type: Date,
            required: false,
        },
        paymentDetails: {
            type: mongoose.Schema.Types.Mixed, // stores payment related details (transactionID, response from payment gateway)
            required: false,
        },
        // -------------------------------
    },
    { timestamps: true }
);

module.exports = mongoose.model("Checkout", checkoutSchema);
