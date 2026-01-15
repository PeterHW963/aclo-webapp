const crypto = require("crypto");
const OrderCounter = require("../models/OrderCounter");

function makeDateKey(d = new Date()) {
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}${mm}${dd}`;
}

function randomBase36(len) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let out = "";
    for (let i = 0; i < len; i++)
        out += chars[crypto.randomInt(0, chars.length)];
    return out;
}

function toBase36Padded(n, width) {
    return n.toString(36).toUpperCase().padStart(width, "0");
}

async function generateOrderId() {
    const dk = makeDateKey();

    const doc = await OrderCounter.findOneAndUpdate(
        { dateKey: dk },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const middle = randomBase36(8);
    const suffix = toBase36Padded(doc.seq, 3);
    return `${dk}${middle}${suffix}`;
}

module.exports = { generateOrderId };
