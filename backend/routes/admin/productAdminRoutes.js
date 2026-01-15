const express = require("express");
const mongoose = require("mongoose");
const Product = require("../../models/Product");
const ProductVariant = require("../../models/ProductVariant");
const { protect, admin } = require("../../middleware/authMiddleware");

const router = express.Router();

// NOTE: I am keeping this just in case in the future, we want to filter
// what is returned from public products and admin products

// @route GET /api/admin/products
// @desc Get all products (Admin only)
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// TODO: Finish implementing this. Don't call this API yet
// @route POST /api/admin/products
// @desc Create Product + default ProductVariant
// @access Private/Admin
router.post("/", protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            sku,
            countInStock,
            category,
            options,
            images,
            isListed,
            dimensions,
            weight,
        } = req.body;

        const createdProduct = await Product.create({
            name,
            description,
            options,
            images,
            isListed,
            dimensions,
            weight,
            user: req.user._id, // reference to admin user who created product
        });

        const createdProductVariant = await ProductVariant.create({
            productId: createdProduct._id,
            sku,
            price,
            discountPrice,
            countInStock,
            category,
            // put default values for now, need to cartesian product next time if needed
            color: options?.color?.[0],
            variant: options?.variant?.[0],
            images,
        });

        res.status(201).json({
            Product: createdProduct,
            ProductVariant: createdProductVariant,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route PATCH /api/admin/products/:id/variants/:variantId
// @desc Update ProductVariant fields
// @access Private/Admin
router.patch("/:id/variants/:variantId", protect, admin, async (req, res) => {
    try {
        const allowed = [
            "sku",
            "price",
            "discountPrice",
            "countInStock",
            "category",
            "color",
            "variant",
            "images",
        ];
        const update = {};
        for (const k of allowed)
            if (req.body[k] !== undefined) update[k] = req.body[k];

        const pv = await ProductVariant.findOneAndUpdate(
            { _id: req.params.variantId, productId: req.params.id },
            { $set: update },
            { new: true }
        );

        if (!pv)
            return res
                .status(404)
                .json({ message: "Variant not found for this product" });
        res.json({ productVariant: pv });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route PATCH /api/admin/products/:id
// @desc Update Product fields
// @access Private/Admin
router.patch("/:id", protect, admin, async (req, res) => {
    const allowed = [
        "name",
        "description",
        "options",
        "images",
        "isListed",
        "dimensions",
        "weight",
        "metaTitle",
        "metaDescription",
        "metaKeywords",
    ];
    const update = {};

    for (const k of allowed)
        if (req.body[k] !== undefined) update[k] = req.body[k];

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: update },
        { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
});

// @route DELETE /api/admin/products/:id
// @desc Delete a product by ID
// @access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const product = await Product.findById(req.params.id).session(
                session
            );
            if (!product) {
                res.status(404).json({ message: "Product not found" });
                return;
            }

            // delete all variants first
            await ProductVariant.deleteMany({ productId: product._id }).session(
                session
            );

            // delete the product
            await product.deleteOne({ session });
        });

        if (res.headersSent) return;
        return res.json({ message: "Product and all variants removed" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    } finally {
        session.endSession();
    }
});

// @route DELETE /api/admin/products/:id/variant/:variantId
// @desc Delete a product Variant
// @access Private/Admin
router.delete("/:id/variants/:variantId", protect, admin, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id, variantId } = req.params;

        await session.withTransaction(async () => {
            const product = await Product.findById(id).session(session);
            if (!product) {
                res.status(404).json({ message: "Product not found" });
                return;
            }

            const pv = await ProductVariant.findOne({
                _id: variantId,
                productId: id,
            }).session(session);

            if (!pv) {
                res.status(404).json({
                    message: "Variant not found for this product",
                });
                return;
            }

            // Capture the option values we want to remove
            const deletedColor = pv.color;
            const deletedVariant = pv.variant;

            // Delete the variant
            await pv.deleteOne({ session });

            // Build a $pull update for Product.options
            const pullUpdate = {};

            if (deletedColor) {
                pullUpdate["options.color"] = deletedColor;
            }
            if (deletedVariant) {
                pullUpdate["options.variant"] = deletedVariant;
            }

            // Apply pull if needed
            if (Object.keys(pullUpdate).length) {
                await Product.updateOne(
                    { _id: id },
                    { $pull: pullUpdate },
                    { session }
                );
            }
        });

        if (res.headersSent) return;
        return res.json({
            message: "Variant removed (product options pruned if unused)",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    } finally {
        session.endSession();
    }
});

module.exports = router;
