require("../../models/User");
const Checkout = require("../../models/Checkout");
const { sendEmail } = require("../../utils/emailService");
const connectDB = require("../../config/db");

function cronAuth(req) {
    // returns a boolean of whether caller is authorized
    const authHeader = req.headers.authorization || "";
    if (!process.env.CRON_SECRET) return false;
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

// @router GET /api/cron/checkout-reminders
// @desc cron job to check if any checkout reminders need to be sent out
// @access Secure
module.exports = async (req, res) => {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        // secure the endpoint
        if (!cronAuth(req)) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // connect to DB cus vercel cron is a serverless function run
        await connectDB();

        const now = new Date();
        // check for whether checkout expires in 3h and 1h
        const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        const in1h = new Date(now.getTime() + 1 * 60 * 60 * 1000);
        // const in3h = new Date(now.getTime() + 5 * 60 * 60 * 1000); // testing 5h prior

        console.log("in3h: ", in3h.toISOString());
        console.log("in1h: ", in1h.toISOString());

        const threeHourRecipients = await Checkout.find({
            isFinalized: false,
            isExpired: false,
            expiresAt: { $gt: in1h, $lte: in3h },
            reminder3hSentAt: null,
        })
            .populate("user", "name email")
            .sort({ expiresAt: 1 })
            .limit(200);

        console.log("3h recipients: ", threeHourRecipients);
        let sent3h = 0;
        for (const checkout of threeHourRecipients) {
            const locked = await Checkout.findOneAndUpdate(
                { _id: checkout._id, reminder3hSentAt: null },
                { $set: { reminder3hSentAt: new Date() } },
                { new: true },
            );

            if (!locked) continue;

            await sendEmail({
                userEmail: checkout.user.email,
                subject:
                    "Reminder: Your checkout will expire in less than 3 hours",
                text: `Hi ${checkout.user.name}, your checkout with ACLOKids will expire at ${locked.expiresAt.toISOString()}. Please complete your checkout to confirm your order.`,
            });

            sent3h++;
        }

        const oneHourRecipients = await Checkout.find({
            isFinalized: false,
            isExpired: false,
            expiresAt: { $gt: now, $lte: in1h },
            reminder1hSentAt: null,
        })
            .populate("user", "name email")
            .limit(200);
        console.log("1h recipients: ", oneHourRecipients);
        let sent1h = 0;
        for (const checkout of oneHourRecipients) {
            const locked = await Checkout.findOneAndUpdate(
                { _id: checkout._id, reminder1hSentAt: null },
                { $set: { reminder1hSentAt: new Date() } },
                { new: true },
            );

            if (!locked) continue;

            await sendEmail({
                userEmail: checkout.user.email,
                subject: "Reminder: Your checkout will expire soon",
                text: `Hi ${checkout.user.name}, your checkout with ACLOKids will expire at ${locked.expiresAt.toISOString()}. Please complete your checkout to confirm your order.`,
            });

            sent1h++;
        }

        // update checkouts to expired so that the cron job doesn't need to check it again later
        const expired = await Checkout.updateMany(
            { isFinalized: false, isExpired: false, expiresAt: { $lte: now } },
            { $set: { isExpired: true } },
        );

        return res.status(200).json({
            ok: true,
            sent3h,
            sent1h,
            expiredMatched: expired.matchedCount,
            expiredModified: expired.modifiedCount,
            now: now.toISOString(),
        });
    } catch (err) {
        console.error("cron checkout error:", err);
        return res.status(500).json({ message: "Server Error" });
    }
};
