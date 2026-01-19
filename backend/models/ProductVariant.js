const mongoose = require("mongoose");

// for inventory management
const productVariantSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
        },
        adminName: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            unique: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        discountPrice: {
            type: Number,
            default: null,
            min: 0,
        },
        countInStock: {
            type: Number,
            default: 0,
            min: 0,
        },
        category: {
            type: String,
            enum: ["Learning Tower", "Stool", "Utensils", "Accessories"],
            required: true,
        },
        // flat, optional option fields
        color: {
            type: String,
            required: false,
        },
        variant: {
            type: String,
            required: false,
        },
        stabiliser: {
            type: String,
            required: false,
            enum: ["Stabiliser", "No stabiliser"],
        },
        ovenMitt: {
            type: String,
            required: false,
        },

        isDefault: {
            // define default productVariant to fetch
            type: Boolean,
            default: false,
        },

        images: {
            type: [
                {
                    publicId: {
                        type: String,
                        required: true,
                    },
                    alt: {
                        type: String,
                        required: false,
                    },
                    _id: false,
                },
            ],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length > 0,
                message: "At least one image is required",
            },
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ProductVariant", productVariantSchema);
