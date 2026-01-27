const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const subscribeRoutes = require("./routes/subscribeRoutes");

const midtransRoutes = require("./routes/midtrans/midtransRoutes");
const midtransWebhook = require("./routes/midtrans/midtransWebhookRoutes");

const biteshipRoutes = require("./routes/biteship/biteshipRoutes");

const adminRoutes = require("./routes/admin/adminRoutes");
const productAdminRoutes = require("./routes/admin/productAdminRoutes");
const orderAdminRoutes = require("./routes/admin/orderAdminRoutes");
const checkoutAdminRoutes = require("./routes/admin/checkoutAdminRoutes");

const { sendEmail } = require("./utils/emailService");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// connect to MongoDB
connectDB();

app.get("/", (req, res) => {
    res.send("WELCOME TO ACLO API");
});

// API Routes
app.use("/api/users", userRoutes); // prepends /api/users to all the user routes
app.use("/api/products", productRoutes); // prepends /api/products to all the product routes
app.use("/api/cart", cartRoutes); // prepends /api/cart to all the cart routes
app.use("/api/checkout", checkoutRoutes); // prepends /api/checkout to all the checkout routes
app.use("/api/orders", orderRoutes); // prepends /api/orders to all the order routes
app.use("/api/upload", uploadRoutes); // prepends /api/upload to all the upload routes
app.use("/api/subscribe", subscribeRoutes); // prepends /api/subscribe to all the subscribe routes
app.use("/api/reviews", reviewRoutes); //prepends /api/reviews to all the subscribe routes

// NOT USED FOR NOW
// app.use("/api/payments/midtrans", midtransRoutes); // prepends /api/payments/midtrans for midtrans payment route
// app.use("/api/webhooks/midtrans", midtransWebhook);

app.use("/api/calculate-shipping", biteshipRoutes); // prepends /api/calculate-shipping for shipping cost calculation

app.get("/api/test-email", async (req, res) => {
    try {
        const result = await sendEmail(
            "peterhadiwijaya963@gmail.com", // Replace with your actual target email
            "Test Button Clicked",
            "The button on the login page works!",
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", orderAdminRoutes);
app.use("/api/admin/checkouts", checkoutAdminRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
