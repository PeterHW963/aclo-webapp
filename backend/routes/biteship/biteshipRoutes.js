const express = require("express");
const router = express.Router();
const axios = require("axios");
const { protect } = require("../../middleware/authMiddleware");
const Product = require("../../models/Product");

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
            !cartItems ||
            !Array.isArray(cartItems) ||
            cartItems.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing required fields: destinationPostalCode and cartItems",
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
        const biteshipItems = [];
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

            biteshipItems.push({
                name: product.name,
                description: product.name,
                value: cartItem.price || 0,
                length: product.dimensions?.length || 10,
                width: product.dimensions?.width || 10,
                height: product.dimensions?.height || 5,
                weight: product.weight,
                quantity: cartItem.quantity || 1,
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

        const couriers = learningTowerQty > 1 ? "jne" : "jne,gojek";

        // Currently requesting the following couriers: JNE, Gojek
        // - update the couriers field below with additional courier codes
        // - refer to biteship documentation: https://biteship.com/en/docs/api/couriers/overview
        const biteshipRequest = {
            origin_postal_code: originPostalCode,
            destination_postal_code: destinationPostalCode,
            couriers: couriers,
            items: biteshipItems,
        };

        const originLat = Number(process.env.BITESHIP_ORIGIN_LAT);
        const originLng = Number(process.env.BITESHIP_ORIGIN_LNG);

        if (Number.isFinite(originLat) && Number.isFinite(originLng)) {
            biteshipRequest.origin_latitude = originLat;
            biteshipRequest.origin_longitude = originLng;
        }

        biteshipRequest.destination_latitude = destinationLatitude;
        biteshipRequest.destination_longitude = destinationLongitude;

        // console.log("Biteship request:", JSON.stringify(biteshipRequest, null, 2));

        const biteshipResponse = await axios.post(
            "https://api.biteship.com/v1/rates/couriers",
            biteshipRequest,
            {
                headers: {
                    Authorization: biteshipApiKey,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!biteshipResponse.data.success) {
            console.error("Biteship API error:", biteshipResponse.data);
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve shipping rates",
            });
        }

        const pricing = biteshipResponse.data.pricing || [];

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

        const shippingOptions = filteredPricing.map((option) => ({
            courierName: option.courier_name,
            courierCode: option.courier_code,
            courierServiceName: option.courier_service_name,
            courierServiceCode: option.courier_service_code,
            description: option.description,
            duration: option.duration,
            price: option.price,
            type: option.type,
        }));

        shippingOptions.sort((a, b) => a.price - b.price);

        res.json({
            success: true,
            options: shippingOptions,
            origin: biteshipResponse.data.origin,
            destination: biteshipResponse.data.destination,
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
