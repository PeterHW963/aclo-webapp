const mongoose = require("mongoose");

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

// NEED TO ADD SHIPPING METHOD
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
            note: { type: String, default: "" },
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
            /*
			pending = user submitted proof, merchant hasn't approved
			rejected = merchant rejected payment proof - either email user / have merchant contact buyer
			processing = proof was accepted, processing for delivery
			shipping = merchant has passed items to courier
			delivered = items have been delivered by courier
			completed = user has accepted item
			cancelled = user requested to cancel purchase
			*/
            enum: [
                "pending",
                "rejected",
                "processing",
                "shipping",
                "delivered",
                "completed",
                "cancelled",
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
