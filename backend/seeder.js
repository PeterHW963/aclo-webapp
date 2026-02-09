const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const ProductVariant = require("./models/ProductVariant");
const User = require("./models/User");
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const Review = require("./models/Review");
const Checkout = require("./models/Checkout");
const products = require("./data/products");
const productVariants = require("./data/productVariants");
const reviews = require("./data/reviews");
const orders = require("./data/orders");
const checkouts = require("./data/checkouts");

const {
    generateCartSnapshotHash,
} = require("./utils/generateCartSnapshotHash.js");

dotenv.config();

// HELPERS
async function connectDB() {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in .env");
    await mongoose.connect(process.env.MONGO_URI);
}

async function clearCollections() {
    await Promise.all([
        Checkout.deleteMany(),
        Product.deleteMany(),
        ProductVariant.deleteMany(),
        User.deleteMany(),
        Cart.deleteMany(),
        Review.deleteMany(),
        Order.deleteMany(),
    ]);
}

async function createAdminUser() {
    return User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "Password123",
        role: "admin",
        isVerified: true,
    });
}

function findByContains(allProducts, keyword) {
    const k = keyword.toLowerCase();
    return allProducts.find((p) => p.name?.toLowerCase().includes(k));
}

function getVariantAndProduct(insertedProducts, insertedVariants, keyword) {
    const product = insertedProducts.find((p) =>
        p.name?.toLowerCase().includes(keyword.toLowerCase())
    );
    if (!product) throw new Error(`Product not found for keyword: ${keyword}`);

    const variant = insertedVariants.find(
        (pv) => pv.productId.toString() === product._id.toString()
    );
    if (!variant)
        throw new Error(`Variant not found for product: ${product.name}`);

    return { product, variant };
}

function injectCheckoutItemIds(checkoutTemplate, { product, variant }) {
    // overwrite the first checkoutItems entry (or build new array if you want)
    const firstItem = checkoutTemplate.checkoutItems?.[0] ?? {};

    return {
        ...checkoutTemplate,
        checkoutItems: [
            {
                ...firstItem,
                productId: product._id,
                productVariantId: variant._id,
            },
        ],
    };
}

function injectCartSnapshotHash(checkoutTemplate) {
    if (
        !checkoutTemplate.checkoutItems ||
        checkoutTemplate.checkoutItems.length === 0
    ) {
        throw new Error(
            "Cannot generate snapshot hash: no checkout items found"
        );
    }
    return {
        ...checkoutTemplate,
        cartSnapshotHash: generateCartSnapshotHash(
            checkoutTemplate.checkoutItems
        ),
    };
}

function buildOrderFromCheckout(orderTemplate, createdCheckout) {
    return {
        ...orderTemplate,
        checkout: createdCheckout._id,

        orderItems: createdCheckout.checkoutItems.map((item) => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            name: item.name,
            image: item.image,
            price: item.price,
            options: item.options,
            quantity: item.quantity,
            weight: 0,
        })),
    };
}

// SEEDER
const seedData = async () => {
    try {
        await connectDB();
        await clearCollections();

        // create default admin user
        const admin = await createAdminUser();
        const userId = admin._id;

        const sampleProducts = products.map((product) => {
            return { ...product, user: userId };
        });
        // Insert Products
        const insertedProducts = await Product.insertMany(sampleProducts);

        // Grab all the products
        const stork = findByContains(insertedProducts, "stork");
        const falcon = findByContains(insertedProducts, "falcon");
        const talon = findByContains(insertedProducts, "talon");
        const quill = findByContains(insertedProducts, "kitchen utensils");
        const quillMittens = findByContains(insertedProducts, "oven mitt");
        const sparrow = findByContains(insertedProducts, "sparrow");
        const beak = findByContains(insertedProducts, "beak");

        if (
            !stork ||
            !falcon ||
            !talon ||
            !quill ||
            !quillMittens ||
            !sparrow ||
            !beak
        ) {
            throw new Error(
                "One or more products not found by name. Check your seed product names exactly."
            );
        }

        // Insert productId mappings for all Product Variants
        const variantsWithProductId = productVariants.map((variant) => {
            const sku = variant.sku;
            if (sku === "MIT") {
                return {
                    ...variant,
                    productId: quillMittens._id,
                };
            }
            if (sku.startsWith("QUI-") && sku !== "MIT") {
                return {
                    ...variant,
                    productId: quill._id,
                };
            }
            if (sku.startsWith("STO-")) {
                return {
                    ...variant,
                    productId: stork._id,
                };
            }
            if (sku.startsWith("FAL-")) {
                return {
                    ...variant,
                    productId: falcon._id,
                };
            }
            if (sku.startsWith("TAL-")) {
                return {
                    ...variant,
                    productId: talon._id,
                };
            }
            if (sku.startsWith("SPA-")) {
                return {
                    ...variant,
                    productId: sparrow._id,
                };
            }
            if (sku === "BEAK") {
                return {
                    ...variant,
                    productId: beak._id,
                };
            }
            throw new Error(`Unknown SKU in productVariants seed: ${sku}`);
        });

        const insertedVariants = await ProductVariant.insertMany(
            variantsWithProductId
        );

        const checkoutTemp = checkouts[0];
        const orderTemp = orders[0];
        if (!checkoutTemp)
            throw new Error("No checkout template found in data/checkouts.js");
        if (!orderTemp)
            throw new Error("No order template found in data/orders.js");

        const { product: sparrowProduct, variant: sparrowVariant } =
            getVariantAndProduct(insertedProducts, insertedVariants, "sparrow");

        // Create multiple checkout-order pairs with different statuses + dates
        const STATUSES = [
            "pending",
            "processing",
            "shipping",
            "cancelling",
            "rejected",
            "delivered",
            "cancelled",
            "returned",
            "refunded",
            "exchanged",
        ];

        // const paidStatuses = new Set([
        //     "processing",
        //     "shipping",
        //     "cancelling",
        //     "delivered",
        //     "cancelled",
        //     "returned",
        //     "refunded",
        //     "exchanged",
        // ]);

        for (let i = 0; i < STATUSES.length; i++) {
            const status = STATUSES[i];

            const checkoutPayload = injectCheckoutItemIds(checkoutTemp, {
                product: sparrowProduct,
                variant: sparrowVariant,
            });

            const checkoutWithHash = injectCartSnapshotHash({
                ...checkoutPayload,
                user: userId,
            });

            const createdCheckout = await Checkout.create({
                ...checkoutWithHash,
                cartId: new mongoose.Types.ObjectId(),
                expiresAt: Date.now(),
            });

            const orderPayload = buildOrderFromCheckout(
                orderTemp,
                createdCheckout
            );

            // const isPaid = paidStatuses.has(status); // irrelevant until midtrans implemented

            await Order.create({
                ...orderPayload,
                user: userId, // inject user
                status,
            });
        }

        await Review.insertMany(reviews);

        console.log("Mock data seeded successfully");
        process.exit();
    } catch (error) {
        console.error("Error seeding the data: ", error);
        process.exit(1);
    }
};

seedData();
