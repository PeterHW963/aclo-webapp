const mongoose = require("mongoose");

const orderCounterSchema = new mongoose.Schema(
    {
        // "251202" (YYMMDD)
        dateKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        // increments per dateKey
        seq: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("OrderCounter", orderCounterSchema);
