const mongoose = require("mongoose");

const orderCounterSchema = new mongoose.Schema(
    {
        dateKey: { type: String, required: true, unique: true },
        seq: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("OrderCounter", orderCounterSchema);
