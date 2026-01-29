const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const sendEmail = async (userEmail, subject, text) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail,
        subject: subject,
        text: text,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
};

const sendOrderStatusEmail = async (order) => {
    // handles order status CHANGES. If there are changes to an order that doesn't change a status (e.g. change tracking link, a separate function is used)
    const userEmail = order.user?.email;
    if (!userEmail) return;

    let subject;
    let text;

    switch (order.status) {
        case "processing":
            subject = `Order #${order.orderId}: Payment accepted`;
            text = `Hi ${order.user.name},\n\nYour payment proof was accepted. Your order is now Processing.\n\nThanks!`;
            break;
        case "rejected":
            subject = `Order #${order.orderId}: Payment rejected`;
            text = `Hi ${order.user.name},\n\nYour payment proof was rejected. Please contact support for further clarification.\n\nThanks!`;
            break;
        case "shipping":
            subject = `Order #${order.orderId}: Shipping has been processed`;
            text = `Hi ${order.user.name},\n\nYour items have been passed to the shipping courier. You may track the order item shipment at this link:\n${order.trackingLink}`;
            break;
        default:
            return { success: true, skipped: true };
    }

    await sendEmail(userEmail, subject, text);
};

const sendTrackingLinkChangeEmail = async (order, oldLink, newLink) => {
    const userEmail = order.user?.email;
    if (!userEmail) return;

    // If no change, skip
    if ((oldLink ?? "") === (newLink ?? "")) {
        return { success: true, skipped: true };
    }

    const subject = `Order #${order.orderId}: Tracking link updated`;

    const text =
        `Hi ${order.user.name},\n\n` +
        `There has been an update to your tracking link.\n\n` +
        `This is your new tracking link:\n${newLink}\n\n` +
        `Thanks!`;

    return await sendEmail(userEmail, subject, text);
};

module.exports = {
    sendEmail,
    sendOrderStatusEmail,
    sendTrackingLinkChangeEmail,
};
