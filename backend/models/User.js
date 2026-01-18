const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const shippingAddressSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	address: {
		type: String,
		required: true,
		trim: true,
	},
	city: {
		type: String,
		required: true,
		trim: true,
	},
	postalCode: {
		type: String,
		required: true,
		trim: true,
	},
	phone: {
		type: String,
		required: true,
		trim: true,
	},
}, { timestamps: true });

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			match: [/.+\@.+\..+/, "Please enter a valid email address"], // email validation using RegEx
		},
		password: {
			type: String,
			required: true,
			minLength: 6,
		},
		role: {
			type: String,
			enum: ["customer", "admin"],
			default: "customer",
		},
		shippingAddresses: [shippingAddressSchema],
		resetPasswordToken: String,
		resetPasswordExpire: Date,
	},
	{ timestamps: true }
);

// Password Hash middleware
// pre is a hook that gets executed before the save operation
userSchema.pre("save", async function () {
	// next param ensures that the next middleware/other operations run aft this code
	if (!this.isModified("password")) return;

	// salt is a random extra data added to password before hashing
	const salt = await bcrypt.genSalt(10); // higher number, more accurate it is but slower
	this.password = await bcrypt.hash(this.password, salt);
});

// match user entered password to hashed pass stored in DB
// we are defining a new instance method to be put inside the methods obejct of the schema
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// Token generation method with expiry time
userSchema.methods.getResetPasswordToken = function () {
	const resetToken = crypto.randomBytes(20).toString("hex");
	this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
	this.resetPasswordExpire = Date.now() + 2 * 60 * 1000; // 2 minutes expiry time (can be adjusted)
	return resetToken;
}

module.exports = mongoose.model("User", userSchema);
