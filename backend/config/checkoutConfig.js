// config/checkoutConfig.js
const CHECKOUT_EXPIRATION_TIME =
    process.env.IS_PRODUCTION === "true"
        ? 6 * 60 * 60 * 1000 // prod
        : 1 * 60 * 1000; // testing

module.exports = { CHECKOUT_EXPIRATION_TIME };
