const express = require("express");
const axios = require("axios");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();
const GOOGLE_SERVER_KEY = process.env.GOOGLE_SERVER_KEY;

// input checker middleware to reduce boilerplate checking in each route
function must(name) {
    return (req, res, next) => {
        if (!req.query[name] || String(req.query[name]).trim() === "") {
            return res
                .status(400)
                .json({ error: `Missing query param: ${name}` });
        }
        next();
    };
}

// @route GET /api/maps/autocomplete
// @desc uses GMaps' Places (New) API to give autocomplete suggestions for a user's address
// @access Private
router.get("/autocomplete", protect, must("input"), async (req, res) => {
    try {
        const input = String(req.query.input);
        const sessionToken = String(req.query.sessionToken || "");
        const url = "https://places.googleapis.com/v1/places:autocomplete";

        const body = {
            input,
            // Bias to Indonesia
            includedRegionCodes: ["ID"],
            sessionToken: sessionToken || undefined,
        };

        const r = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_SERVER_KEY,
                // FieldMask limits what you receive (important for cost + performance)
                "X-Goog-FieldMask":
                    "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
            },
            body: JSON.stringify(body),
        });

        const data = await r.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "Autocomplete failed" });
    }
});

// @route GET /api/maps/details
// @desc uses GMaps' Places (New) API to get details of a user's address including longitude latitude
// @access Private
router.get("/details", protect, must("placeId"), async (req, res) => {
    try {
        const placeId = String(req.query.placeId);
        const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;

        const r = await fetch(url, {
            headers: {
                "X-Goog-Api-Key": GOOGLE_SERVER_KEY,
                "X-Goog-FieldMask":
                    "id,formattedAddress,addressComponents,location,displayName",
            },
        });

        const data = await r.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "Place details failed" });
    }
});

// @route GET /api/maps/details
// @desc uses GMaps' Geocoding API to get longitude and latitude of a location, the links it to an address
// @access Private
router.get(
    "/geocode-reverse",
    protect,
    must("lat"),
    must("lng"),
    async (req, res) => {
        try {
            const lat = String(req.query.lat);
            const lng = String(req.query.lng);

            // Geocoding API reverse uses latlng query param
            const url = new URL(
                "https://maps.googleapis.com/maps/api/geocode/json",
            );
            url.searchParams.set("latlng", `${lat},${lng}`);
            url.searchParams.set("key", GOOGLE_SERVER_KEY);
            url.searchParams.set("region", "id");

            const r = await fetch(url);
            const data = await r.json();
            res.json(data);
        } catch (e) {
            res.status(500).json({ error: "Reverse geocode failed" });
        }
    },
);

module.exports = router;
