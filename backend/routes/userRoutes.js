const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { sendEmail } = require("../utils/emailService.js");

dotenv.config();
const router = express.Router();

// @route POST /api/users/register
// @desc Register a new user
// @access Public
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Registration logic
        let user = await User.findOne({ email });
        if (user)
            return res.status(400).json({ message: "User already exists" });
        user = new User({ name, email, password });
        await user.save();

        // create JWT payload - contains info about user id and role, embedded in token and decoded for authorizing user at backend
        const payload = { user: { id: user._id, role: user.role } };

        // sign and return token along with user data
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "24h" },
            (err, token) => {
                if (err) throw err;

                // send user and token in response
                res.status(201).json({
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        shippingAddresses: [],
                    },
                    token,
                });
            }
        );
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route POST /api/users/login
// @desc Authenticate user
// @access Public
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // find user by email
        let user = await User.findOne({ email });

        if (!user)
            return res.status(400).json({ message: "User does not exist" });
        const isMatch = await user.matchPassword(password);

        if (!isMatch)
            return res.status(400).json({ message: "Wrong user or password" });

        // create JWT payload
        const payload = { user: { id: user._id, role: user.role } };

        // sign and return token along with user data
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "24h" },
            (err, token) => {
                if (err) throw err;

                // send user and token in response
                res.status(200).json({
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        shippingAddresses: user.shippingAddresses || [],
                    },
                    token,
                });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route GET /api/users/profile
// @desc Get logged-in user's profile (Protected Route)
// @access Private
router.get("/profile", protect, async (req, res) => {
    res.json(req.user);
});

// @route POST /api/users/profile/addresses
// @desc Add a new shipping address to user's profile
// @access Private
router.post("/profile/addresses", protect, async (req, res) => {
    try {
        const { name, address, city, postalCode, phone } = req.body;

        const user = await User.findById(req.user._id);
        if (!user)
            return res.status(400).json({ message: "User does not exist" });

        user.shippingAddresses.push({
            name,
            address,
            city,
            postalCode,
            phone,
        });

        await user.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shippingAddresses: user.shippingAddresses,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route PATCH /api/users/profile/addresses/:addressId
// @desc Update a shipping address
// @access Private
router.patch("/profile/addresses/:addressId", protect, async (req, res) => {
    try {
        const { addressId } = req.params;
        const { name, address, city, postalCode, phone } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const addressToUpdate = user.shippingAddresses.id(addressId);

        if (!addressToUpdate) {
            return res.status(404).json({ message: "Address not found" });
        }

        if (name) addressToUpdate.name = name;
        if (address) addressToUpdate.address = address;
        if (city) addressToUpdate.city = city;
        if (postalCode) addressToUpdate.postalCode = postalCode;
        if (phone) addressToUpdate.phone = phone;

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shippingAddresses: user.shippingAddresses,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route POST /api/users/forgot-password
// @desc Handles the forgot password flow
// @access Public
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User does not exist!" });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const message = `Click the link below to reset your password: \n\n ${resetUrl}`;

        try {
            await sendEmail(user.email, "Reset your password", message);
            res.status(200).json({
                success: true,
                data: "Email sent successfully",
            });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: "Email could not be sent" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});

// @route PUT /api/users/reset-password/:resetToken
// @desc Reset password
// @access Public
router.put("/reset-password/:resetToken", async (req, res) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");
    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid or expired Token" });
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            data: "Password reset successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
module.exports = router;
