const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const crypto = require("crypto");
const { sendEmail } = require("../utils/emailService.js");
const { validatePassword } = require("../utils/passwordValidator.js");
const {
    getVerificationEmailTemplate,
    getPasswordResetTemplate,
} = require("../utils/emailTemplates.js");

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

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                message: "Password does not meet requirements",
                errors: passwordValidation.errors 
            });
        }
        
        user = new User({ name, email, password, isVerified: false });
        
        // Generate verification token & URL
        const verificationToken = user.getVerificationToken();
        await user.save({ validateBeforeSave: false });

        const verificationUrl = `${process.env.FRONTEND_URL}/verified?token=${verificationToken}`;
        const textMessage = `Hi ${name},\n\nThank you for registering! Please verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nThanks!`;
        const htmlMessage = getVerificationEmailTemplate(name, verificationUrl);

        try {
            await sendEmail(user.email, "Verify Your Email Address", textMessage, htmlMessage);
            res.status(201).json({
                success: true,
                message: "Registration successful",
            });
        } catch (error) {
            // delete the user if email sending fails
            await User.findByIdAndDelete(user._id);
            console.error(error);
            return res.status(500).json({ message: "Verification email could not be sent" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route GET /api/users/verify-email/:verificationToken
// @desc Verify user's email address
// @access Public
router.get("/verify-email/:verificationToken", async (req, res) => {
    try {
        const verificationToken = crypto
            .createHash("sha256")
            .update(req.params.verificationToken)
            .digest("hex");

        const user = await User.findOne({
            verificationToken,
            verificationExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpire = undefined;
        await user.save();

        // create JWT payload - contains info about user id and role, embedded in token and decoded for authorizing user at backend
        const payload = { user: { id: user._id, role: user.role, isVerified: user.isVerified } };

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
                        isVerified: user.isVerified,
                        shippingAddresses: [],
                    },
                    token,
                });
            },
        );
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route POST /api/users/resend-verification
// @desc Resend verification email
// @access Private
router.post("/resend-verification", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const verificationToken = user.getVerificationToken();
        await user.save({ validateBeforeSave: false });

        const verificationUrl = `${process.env.FRONTEND_URL}/verified?token=${verificationToken}`;
        const textMessage = `Hi ${user.name},\n\nPlease verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nThanks!`;
        const htmlMessage = getVerificationEmailTemplate(user.name, verificationUrl);

        try {
            await sendEmail(user.email, "Verify your email address", textMessage, htmlMessage);
            res.status(200).json({
                message: "Verification email sent",
            });
        } catch (error) {
            console.error("Email sending failed", error);
            return res.status(500).json({ message: "Email could not be sent" });
        }
    } catch (error) {
        console.error(error);
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
            return res.status(400).json({ message: "Wrong email or password" });

        // create JWT payload
        const payload = { user: { id: user._id, role: user.role, isVerified: user.isVerified } };

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
                        isVerified: user.isVerified,
                        shippingAddresses: user.shippingAddresses || [],
                    },
                    token,
                });
            },
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
        const {
            name,
            address,
            addressDetails,
            city,
            postalCode,
            phone,
            latitude,
            longitude,
        } = req.body;

        const user = await User.findById(req.user._id);
        if (!user)
            return res.status(400).json({ message: "User does not exist" });

        user.shippingAddresses.push({
            name,
            address,
            addressDetails,
            city,
            postalCode,
            phone,
            latitude,
            longitude,
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
    
    // Generic response to prevent email enumeration (always returned to user)
    const genericResponse = {
        success: true,
        message: "If an account with that email exists, a password reset link has been sent",
    };
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found for email: ${email}`);
            return res.status(200).json(genericResponse);
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const textMessage = `Click the link below to reset your password: \n\n ${resetUrl}`;
        const htmlMessage = getPasswordResetTemplate(resetUrl);

        try {
            await sendEmail(user.email, "Reset your password", textMessage, htmlMessage);
            console.log(`Forgot Password Reset email sent successfully to: ${user.email}`);
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            console.error(`Failed to send Forgot Password Reset email to: ${user.email}`, err.message);
        }
        
        // Always return the same response for security
        res.status(200).json(genericResponse);
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
        
        const passwordValidation = validatePassword(req.body.password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                message: "Password does not meet requirements",
                errors: passwordValidation.errors 
            });
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
