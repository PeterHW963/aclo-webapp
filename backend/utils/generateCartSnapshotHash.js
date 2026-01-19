const crypto = require("crypto");

function generateCartSnapshotHash(cartItems) {
    return crypto
        .createHash("sha256")
        .update(JSON.stringify(
            cartItems.map(i => ({
                productId: i.productId,
                productVariantId: i.productVariantId,
                options: i.options,
                quantity: i.quantity,
            }))
        )).digest("hex");
}

module.exports = {generateCartSnapshotHash};