const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const getUnitPrice = (pv) => {
    return pv.discountPrice ?? pv.price;
};

// Helper function to get a cart by userId or guestId
const getCart = async (userId, guestId) => {
    if (userId) {
        return await Cart.findOne({ user: userId });
    } else if (guestId) {
        return await Cart.findOne({ guestId });
    }
    return null;
};

// Helper function to check if a Cart products' map's contents are the same
const sameOptions = (a = {}, b = {}) => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key) => a[key] === b[key]);
};

// @route POST /api/cart
// @desc Add a product to the cart for a guest or logged in user
// @access Public
router.post("/", async (req, res) => {
    const { productId, productVariantId, quantity, options, guestId, userId } =
        req.body;
    try {
        if (!productId || !productVariantId) {
            return res.status(400).json({
                message: "productId and productVariantId are required",
            });
        }
        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: "Product Not Found" });

        const pv = await ProductVariant.findOne({
            _id: productVariantId,
            productId,
        });
        if (!pv)
            return res
                .status(404)
                .json({ message: "ProductVariant Not Found" });

        const unitPrice = getUnitPrice(pv);
        // Determine if user is logged in or guest
        let cart = await getCart(userId, guestId);

        // if the cart exists, update it
        if (cart) {
            const productVariantIndex = cart.products.findIndex(
                (p) => p.productVariantId?.toString() === productVariantId
            );

            if (productVariantIndex > -1) {
                // product alr exists, update the quantity
                cart.products[productVariantIndex].quantity += quantity;
                cart.products[productVariantIndex].price = unitPrice;
                cart.products[productVariantIndex].options = options ?? {};
            } else {
                // add new product
                cart.products.push({
                    productId,
                    productVariantId,
                    name: product.name,
                    image: pv.images?.[0]?.publicId,
                    options: options ?? {}, // options from request body
                    price: unitPrice,
                    quantity,
                });
            }
            // Recalculate total price
            cart.totalPrice = cart.products.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );
            await cart.save();
            return res.status(200).json(cart);
        } else {
            // Create a new cart for the guest/user
            const newCart = await Cart.create({
                user: userId ? userId : undefined,
                guestId: guestId ? guestId : "guest_" + new Date().getTime(),
                products: [
                    {
                        productId,
                        productVariantId,
                        name: product.name,
                        image: pv.images?.[0]?.publicId,
                        options: options ?? {},
                        price: unitPrice,
                        quantity,
                    },
                ],
                totalPrice: unitPrice * quantity,
            });
            return res.status(201).json(newCart);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route PUT /api/cart
// @desc Update product quantity in the cart for a guest/logged-in user
// @access Public
router.put("/", async (req, res) => {
    const { productVariantId, quantity, options, guestId, userId } = req.body;
    if (!productVariantId) {
        return res
            .status(400)
            .json({ message: "productVariantId is required" });
    }
    if (typeof quantity !== "number") {
        return res.status(400).json({ message: "quantity must be a number" });
    }
    try {
        let cart = await getCart(userId, guestId);
        if (!cart) return res.status(404).json({ message: "Cart Not Found" });

        const productIndex = cart.products.findIndex((p) => {
            return (
                p.productVariantId?.toString() === productVariantId &&
                sameOptions(p.options, options)
            );
        });

        if (productIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }
        // update quantity
        if (quantity > 0) {
            cart.products[productIndex].quantity = quantity;
            // refresh price from DB on update
            const pv = await ProductVariant.findById(productVariantId);
            if (pv) cart.products[productIndex].price = getUnitPrice(pv);
        } else {
            cart.products.splice(productIndex, 1); // remove product if quantity is 0
        }

        cart.totalPrice = cart.products.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        await cart.save();
        return res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route DELETE /api/cart
// @desc Remove a product from the cart
// @access Public
router.delete("/", async (req, res) => {
    const { productVariantId, options, guestId, userId } = req.body;
    try {
        let cart = await getCart(userId, guestId);
        if (!cart) return res.status(404).json({ message: "Cart Not Found" });

        const productVariantIndex = cart.products.findIndex((p) => {
            const sameVariant =
                p.productVariantId?.toString() === productVariantId;
            const sameOpts = sameOptions(p.options, options);
            return sameVariant && sameOpts;
        });

        if (productVariantIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        cart.products.splice(productVariantIndex, 1);
        cart.totalPrice = cart.products.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        // TODO: add logic to remove the cart document if it's empty
        await cart.save();
        return res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route GET /api/cart
// @desc Get logged-in user's or guest user's cart
// @access Public
router.get("/", async (req, res) => {
    const { userId, guestId } = req.query;
    try {
        const cart = await getCart(userId, guestId);
        if (cart) {
            res.json(cart);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route GET /api/cart/:cartId
// @desc Get cart by cartId
// @access Private
router.get("/:cartId", protect, async (req, res) => {
    const { cartId } = req.params;
    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ message: "Cart Not Found" });

    // Ownership check
    if (String(cart.user) !== String(req.user._id)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    res.json(cart);
});

// @route POST /api/cart/merge
// @desc Merge guest cart into user cart on login
// @access Private
router.post("/merge", protect, async (req, res) => {
    const { guestId } = req.body;
    try {
        const guestCart = await Cart.findOne({ guestId });
        const userCart = await Cart.findOne({ user: req.user._id });
        if (guestCart) {
            if (guestCart.products.length === 0) {
                return res.status(400).json({ message: "Guest Cart is Empty" });
            }

            if (userCart) {
                // merge guest cart into user cart
                guestCart.products.forEach((guestItem) => {
                    const productIndex = userCart.products.findIndex(
                        (item) =>
                            item.productVariantId.toString() ===
                                guestItem.productVariantId.toString() &&
                            sameOptions(item.options, guestItem.options)
                    );
                    if (productIndex > -1) {
                        // if item exists in the user cart, update quantity
                        userCart.products[productIndex].quantity +=
                            guestItem.quantity;
                    } else {
                        // otherwise, just add guest item to the cart
                        userCart.products.push(guestItem);
                    }
                });
                userCart.totalPrice = userCart.products.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                );

                await userCart.save();

                // remove guest cart after merging
                try {
                    await Cart.findOneAndDelete({ guestId });
                } catch (error) {
                    console.error("Error deleting guest cart: ", error);
                }
                res.status(200).json(userCart);
            } else {
                // if user has no existing cart, assign the guest cart to the user
                guestCart.user = req.user._id;
                guestCart.guestId = undefined;
                await guestCart.save();

                res.status(200).json(guestCart);
            }
        } else {
            // no guest cart
            if (userCart) {
                // Guest cart has already been merged, return user cart
                return res.status(200).json(userCart);
            }
            res.status(404).json({ message: "Guest cart not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
