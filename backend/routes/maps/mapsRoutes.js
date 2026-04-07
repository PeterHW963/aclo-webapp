const express = require("express");
const rateLimit = require("express-rate-limit");
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

// rate-limiters per user
const autocompleteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: { error: "Too many autocomplete requests." },
});

const detailsLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: { error: "Too many place detail requests." },
});

const reverseGeocodeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: { error: "Too many reverse geocode requests." },
});

// helper for google API error parsing
async function readGoogleError(r) {
    let data = null;

    try {
        data = await r.json();
    } catch {
        // ignore
    }

    if (r.ok) {
        return { ok: true, data };
    }

    const googleMessage =
        data?.error?.message || data?.status || "Google Maps request failed";

    if (r.status === 429) {
        return {
            ok: false,
            status: 429,
            body: { error: "Google Maps quota exceeded. Try again later." },
        };
    }

    if (r.status === 403) {
        return {
            ok: false,
            status: 403,
            body: { error: `Google Maps access denied: ${googleMessage}` },
        };
    }

    return {
        ok: false,
        status: r.status || 500,
        body: { error: googleMessage },
    };
}

// @route GET /api/maps/autocomplete
// @desc uses GMaps' Places (New) API to give autocomplete suggestions for a user's address
// @access Private
router.get(
    "/autocomplete",
    protect,
    autocompleteLimiter,
    must("input"),
    async (req, res) => {
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

            const result = await readGoogleError(r);
            if (!result.ok) {
                return res.status(result.status).json(result.body);
            }

            return res.json(result.data);
        } catch (e) {
            res.status(500).json({ error: "Autocomplete failed" });
        }
    },
);

// @route GET /api/maps/details
// @desc uses GMaps' Places (New) API to get details of a user's address including longitude latitude
// @access Private
router.get(
    "/details",
    protect,
    detailsLimiter,
    must("placeId"),
    async (req, res) => {
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

            const result = await readGoogleError(r);
            if (!result.ok) {
                return res.status(result.status).json(result.body);
            }

            return res.json(result.data);
        } catch (e) {
            res.status(500).json({ error: "Place details failed" });
        }
    },
);

// @route GET /api/maps/geocode-reverse
// @desc uses GMaps' Geocoding API to get longitude and latitude of a location, the links it to an address
// @access Private
router.get(
    "/geocode-reverse",
    protect,
    reverseGeocodeLimiter,
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
            if (!r.ok) {
                return res.status(r.status).json({
                    error: data?.error_message || "Reverse geocode failed",
                    status: r.status,
                });
            }
            if (data?.status === "OVER_QUERY_LIMIT") {
                return res.status(429).json({
                    error: "Google Maps quota exceeded. Try again later.",
                    code: "GOOGLE_OVER_QUERY_LIMIT",
                });
            }
            if (data?.status === "REQUEST_DENIED") {
                return res.status(403).json({
                    error: data?.error_message || "Google Maps request denied.",
                    code: "GOOGLE_REQUEST_DENIED",
                });
            }
            if (data?.status === "INVALID_REQUEST") {
                return res.status(400).json({
                    error: data?.error_message || "Invalid geocode request.",
                    code: "GOOGLE_INVALID_REQUEST",
                });
            }
            if (data?.status !== "OK" && data?.status !== "ZERO_RESULTS") {
                return res.status(502).json({
                    error:
                        data?.error_message || "Unexpected Google Maps error.",
                    code: data?.status || "GOOGLE_UNKNOWN_ERROR",
                });
            }
            return res.json(data);
        } catch (e) {
            res.status(500).json({ error: "Reverse geocode failed" });
        }
    },
);

module.exports = router;
