const express = require("express");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/products
// @desc Get all products
// @access Public
router.get("/", async (req, res) => {
    try {
        const products = await Product.find(); // no filter = get all
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route POST /api/products/variants/bulk
// @desc Get default variants for multiple products
// @access Public
router.post("/variants/bulk", async (req, res) => {
    try {
        const { productIds } = req.body; // Expecting ["id1", "id2"...]

        const variants = await ProductVariant.find({
            productId: { $in: productIds },
        });

        res.json(variants);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// TODO: API NOT NEEDED
// @route GET /api/products/similar/:id
// @desc Retrieve similar products based on current product's default variant's category
// @access Public
router.get("/similar/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const baseVariant = await ProductVariant.findOne({
            productId: id,
        }).lean();
        if (!baseVariant)
            return res.status(404).json({ message: "No variants found" });

        const similarVariants = await ProductVariant.find({
            productId: { $ne: id },
            category: baseVariant.category,
        })
            .select("productId")
            .limit(4)
            .lean();

        const productIds = [
            ...new Set(similarVariants.map((v) => String(v.productId))),
        ];

        const similarProducts = await Product.find({
            _id: { $in: productIds },
        });
        return res.json(similarProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route GET /api/products/:id/variants
// @desc Get all variants for one product
// @access Public
router.get("/:id/variants", async (req, res) => {
    try {
        const { id } = req.params;

        const variants = await ProductVariant.find({ productId: id });

        return res.json(variants);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});

// UNUSED FOR NOW
// @route GET /api/products/:id/variant?color=Red&variant=Stork
// @desc Get a single product variant based on query params. Return value includes variant's _id
// @access Public
router.get("/:id/variant", async (req, res) => {
    try {
        const { id } = req.params;
        const { color, variant, ovenMitt, stabiliser, productVariantId } =
            req.query;

        const hasAttributeParams =
            color != null ||
            variant != null ||
            ovenMitt != null ||
            stabiliser != null;

        let pv;

        if (productVariantId) {
            // If ID is provided, strictly match by that ID
            pv = await ProductVariant.findOne({
                productId: id,
                _id: productVariantId,
            });
        } else if (hasAttributeParams) {
            // Fetch by selected attributes
            const q = { productId: id };

            if (color != null) q.color = color;
            if (variant != null) q.variant = variant;
            if (ovenMitt != null) q.ovenMitt = ovenMitt;
            if (stabiliser != null) q.stabiliser = stabiliser;

            pv = await ProductVariant.findOne(q);
        } else {
            // No params selected yet:
            // fetch cheapest in-stock variant
            pv = await ProductVariant.findOne({
                productId: id,
                countInStock: { $gt: 0 },
            }).sort({
                discountPrice: 1,
                price: 1,
            });
        }

        if (!pv)
            return res
                .status(404)
                .json({ message: "Matching variant not found" });
        return res.json(pv); // returns the variantId in the _id field
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});

// @route GET /api/products/:id
// @desc Get a single product by ID
// @access Public
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product Not Found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
