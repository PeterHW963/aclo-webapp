const mongoose = require("mongoose");

const { generateOrderId } = require("../utils/generateOrderId");

const orderItemSchema = new mongoose.Schema(
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
        weight: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        checkout: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Checkout",
            required: true,
        },
        orderItems: [orderItemSchema],
        shippingDetails: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            phone: { type: String, required: true },
        },
        shippingCost: {
            type: Number,
            default: 0,
        },
        shippingMethod: {
            type: String,
            required: true,
        },
        shippingCourier: {
            type: String,
            required: true,
        },
        shippingDuration: {
            type: String,
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        paymentProof: {
            publicId: { type: String, default: "" },
            uploadedAt: { type: Date },
            status: {
                type: String,
                enum: ["none", "pending", "approved", "rejected"],
                default: "none",
            },
        },
        noteToSeller: {
            type: String,
            default: "",
        },
        cancelRequest: {
            type: {
                reason: { type: String, default: "" },
                createdAt: { type: Date },
            },
            default: undefined,
        },
        adminRemarks: {
            type: String,
            default: "",
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: {
            // timestamp when payment was made
            type: Date,
            required: false,
        },
        trackingLink: {
            type: String,
            default: "",
        },
        deliveredAt: {
            type: Date,
            required: false,
        },
        paymentDetails: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
        },
        status: {
            type: String,
            enum: [
                // in prog orders
                "pending", // order placed by buyer and pending payment proof approval
                "processing", // payment proof approved, processing for delivery
                "shipping", // seller has passed items to courier
                "cancelling", // user is requesting to cancel order, if approved seller will refund
                // resolved orders
                "rejected", // payment proof invalid, auto-email buyer + merchant may contact buyer
                "delivered", // item has been delivered by courier
                "cancelled", // order cancelled and money refunded
                // failed orders - admin manually change to these from Delivered
                "returned", // item is returned and money refunded
                "refunded", // buyer keeps item and money refunded
                "exchanged", // item is returned and seller sends another item
            ],
            default: "pending",
        },
    },
    { timestamps: true }
);

orderSchema.pre("validate", async function () {
    if (this.orderId) return;
    this.orderId = await generateOrderId();
});

module.exports = mongoose.model("Order", orderSchema);
