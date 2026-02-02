const express = require("express");
const router = express.Router();
const axios = require("axios");
const { protect } = require("../../middleware/authMiddleware");
const Product = require("../../models/Product");

function volumetricKg(length, width, height, divisor = 5000) {
    const l = Number(length);
    const w = Number(width);
    const h = Number(height);
    if (!l || !w || !h) return 0;
    return (l * w * h) / divisor;
}

function applyMarkup(price, multiplier = 1.1) {
    const p = Number(price);
    if (!Number.isFinite(p)) return price;
    return Math.ceil(p * multiplier);
}

/**
 * @route   POST /api/calculate-shipping
 * @desc    Calculate shipping costs using Biteship API
 * @access  Private
 */
router.post("/", protect, async (req, res) => {
    try {
        const {
            destinationPostalCode,
            destinationLatitude,
            destinationLongitude,
            cartItems,
        } = req.body;

        if (
            !destinationPostalCode ||
            !destinationLatitude ||
            !destinationLongitude ||
            !cartItems ||
            !Array.isArray(cartItems) ||
            cartItems.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing required fields: destinationPostalCode / destinationLatitude / destinationLongitude / cartItems",
            });
        }

        // Validate postal code format
        if (!/^\d{5}$/.test(destinationPostalCode)) {
            return res.status(400).json({
                success: false,
                message: "Invalid postal code format. Must be 5 digits.",
            });
        }

        // Get origin postal code from .env
        // TODO: set origin (sender) postal code in .env
        const originPostalCode = process.env.BITESHIP_ORIGIN_POSTAL_CODE;
        if (!originPostalCode) {
            console.error("BITESHIP_ORIGIN_POSTAL_CODE not configured");
            return res.status(500).json({
                success: false,
                message: "Shipping service not properly configured",
            });
        }

        // Build request and send to Biteship API
        const biteshipApiKey = process.env.BITESHIP_API_KEY;
        if (!biteshipApiKey) {
            console.error("BITESHIP_API_KEY not configured");
            return res.status(500).json({
                message: "Shipping service not properly configured",
            });
        }

        // load product data
        const productIds = cartItems.map((item) => item.productId);
        const products = await Product.find({
            _id: { $in: productIds },
        }).select("name dimensions weight category");

        const productMap = {};
        products.forEach((product) => {
            productMap[product._id.toString()] = product;
        });

        // count quantity of Learning Tower items
        let learningTowerQty = 0;

        // Construct items array for Biteship API
        const baseItems = [];

        // const biteshipItems = [];
        for (const cartItem of cartItems) {
            const product = productMap[cartItem.productId];

            if (!product) {
                return res.status(400).json({
                    message: `Product Not Found: ${cartItem.productId}`,
                });
            }

            if (!product.weight || product.weight <= 0) {
                return res.status(400).json({
                    message: `Product "${product.name}" does not have weight data configured`,
                });
            }

            if (product.category === "Learning Tower") {
                learningTowerQty += cartItem.quantity || 1;
            }

            baseItems.push({
                name: product.name,
                description: product.name,
                value: cartItem.price || 0,
                length: product.dimensions.length,
                width: product.dimensions.width,
                height: product.dimensions.height,
                weight: product.weight,
                quantity: cartItem.quantity || 1,
            });
        }

        // JNE REQUEST
        const jneItems = baseItems.map((item) => {
            const volKg = volumetricKg(
                item.length,
                item.width,
                item.height,
                5000,
            );
            const chargeable = Math.max(item.weight, volKg);
            return {
                name: item.name,
                description: item.description,
                value: item.value,
                length: item.length,
                width: item.width,
                height: item.height,
                weight: chargeable,
                quantity: item.quantity,
            };
        });

        const jneRequest = {
            origin_postal_code: originPostalCode,
            destination_postal_code: destinationPostalCode,
            couriers: "jne",

            items: jneItems,
        };

        // GOJEK REQUEST
        const originLat = Number(process.env.BITESHIP_ORIGIN_LAT);
        const originLng = Number(process.env.BITESHIP_ORIGIN_LNG);
        const hasOriginCoords =
            Number.isFinite(originLat) && Number.isFinite(originLng);

        const destLat = Number(destinationLatitude);
        const destLng = Number(destinationLongitude);
        const hasDestCoords =
            Number.isFinite(destLat) && Number.isFinite(destLng);

        // Always request gojek if we have coords (rates will show on frontend)
        const shouldRequestToGojek = hasOriginCoords && hasDestCoords;

        // Flag: frontend should disable gojek selection if LT qty > 1
        const gojekDisabled = learningTowerQty > 1;

        let gojekRequest = null;
        if (shouldRequestToGojek) {
            // ONE safe item only (always)
            const SAFE_LENGTH = 50;
            const SAFE_WIDTH = 70;
            const SAFE_HEIGHT = 20; // cm
            const SAFE_WEIGHT = 1000; // g

            const gojekItems = [
                {
                    name: "Cart (estimated)",
                    description:
                        "Estimated package size for Gojek rate preview",
                    value: 0,
                    length: SAFE_LENGTH,
                    width: SAFE_WIDTH,
                    height: SAFE_HEIGHT,
                    weight: SAFE_WEIGHT,
                    quantity: 1,
                },
            ];
            gojekRequest = {
                origin_latitude: originLat,
                origin_longitude: originLng,
                destination_latitude: destLat,
                destination_longitude: destLng,
                couriers: "gojek",
                items: gojekItems,
            };
        }

        // Call biteship (possibly twice)
        const headers = {
            Authorization: biteshipApiKey,
            "Content-Type": "application/json",
        };

        const [jneResp, gojekResp] = await Promise.all([
            axios.post(
                "https://api.biteship.com/v1/rates/couriers",
                jneRequest,
                {
                    headers,
                },
            ),
            gojekRequest
                ? axios.post(
                      "https://api.biteship.com/v1/rates/couriers",
                      gojekRequest,
                      { headers },
                  )
                : Promise.resolve(null),
        ]);

        const jneData = jneResp?.data;
        if (!jneData?.success) {
            console.error("Biteship JNE API error:", jneData);
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve JNE shipping rates",
            });
        }

        const gojekData = gojekResp?.data;
        if (gojekResp && !gojekData?.success) {
            // If gojek fails, we can still return JNE.
            console.error("Biteship Gojek API error:", gojekData);
        }
        // Merge pricing arrays
        const pricing = [
            ...(jneData.pricing || []),
            ...((gojekData && gojekData.pricing) || []),
        ];

        // Filter shipping options
        const filteredPricing = pricing.filter(
            (opt) =>
                !(
                    opt.courier_code === "jne" &&
                    opt.courier_service_code === "yes"
                ), // remove JNE YES service if any
        );

        if (filteredPricing.length === 0) {
            return res.status(404).json({
                message: "No shipping options available for this postal code",
            });
        }

        // map + markup x1.1
        const shippingOptions = filteredPricing.map((option) => {
            const markedUp = applyMarkup(option.price, 1.1);
            return {
                courierName: option.courier_name,
                courierCode: option.courier_code,
                courierServiceName: option.courier_service_name,
                courierServiceCode: option.courier_service_code,
                description: option.description,
                duration: option.duration,
                // price: option.price, // uncomment if you want to debug
                price: markedUp,
                type: option.type,
            };
        });

        shippingOptions.sort((a, b) => a.price - b.price);

        res.json({
            success: true,
            options: shippingOptions,
            origin: jneData.origin || gojekData?.origin,
            destination: jneData.destination || gojekData?.destination,
            gojekDisabled,
        });
    } catch (error) {
        console.error(error);

        if (error.response?.data) {
            return res.status(error.response.status || 500).json({
                message:
                    error.response.data.message ||
                    "Something went wrong. Please check your address and try again.",
                error: error.response.data,
            });
        }

        res.status(500).json({
            message: "Failed to calculate shipping cost",
            error: error.message,
        });
    }
});

module.exports = router;
