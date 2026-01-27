const mongoose = require("mongoose");

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("Missing MONGO_URI");

        cached.promise = mongoose
            .connect(uri)
            .then((m) => {
                console.log("MongoDB connected successfully");
                return m;
            })
            .catch((err) => {
                // If connection fails, reset promise so next call can retry
                cached.promise = null;
                console.error("MongoDB connection failed.", err);
                throw err;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

module.exports = connectDB;
