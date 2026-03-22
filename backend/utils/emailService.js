const nodemailer = require("nodemailer");
const {
    getOrderStatusTemplate,
    getTrackingLinkChangeTemplate,
} = require("./emailTemplates");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const sendEmail = async (userEmail, subject, text, html = null) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail,
        subject: subject,
        text: text,
        ...(html && { html }),
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

const sendOrderStatusEmail = async (order, includePending = false) => {
    // handles order status CHANGES. If there are changes to an order that doesn't change a status (e.g. change tracking link, a separate function is used)
    const userEmail = order.user?.email;
    if (!userEmail) return;

    let subject;
    let text;
    let html;

    if (includePending && order.status == "pending") {
        // covers case where it goes "cancelling" --> "pending"
        subject = `Order #${order.orderId}: Cancellation request rejected`;
        text =
            `Hi ${order.user.name},\n\n` +
            `Your request for order cancellation for Order #${order.orderId} has been rejected.\n` +
            `This order is now marked as pending.\n\n` +
            `If you have any questions, feel free to contact our support team.\n\n` +
            `Thank you.`;

        html = getOrderStatusTemplate({
            name: order.user.name,
            orderId: order.orderId,
            status: order.status,
            trackingLink: order.trackingLink,
        });

        await sendEmail(userEmail, subject, text, html);
        return;
    }

    switch (order.status) {
        case "processing":
            subject = `Order #${order.orderId}: Payment accepted`;
            text =
                `Hi ${order.user.name},\n\n` +
                `Your payment proof for Order #${order.orderId} was accepted. ` +
                `Your order is now Processing.\n\nThanks!`;
            break;

        case "rejected":
            subject = `Order #${order.orderId}: Payment rejected`;
            text =
                `Hi ${order.user.name},\n\n` +
                `Your payment proof for Order #${order.orderId} was rejected. ` +
                `Please contact support for further clarification.\n\nThanks!`;
            break;

        case "shipping":
            subject = `Order #${order.orderId}: Shipping has been processed`;
            text =
                `Hi ${order.user.name},\n\n` +
                `Your items for Order #${order.orderId} have been passed to the shipping courier.` +
                `${order.trackingLink ? ` You may track your shipment here:\n${order.trackingLink}` : ""}` +
                `\n\nThanks!`;
            break;

        case "delivered":
            subject = `Order #${order.orderId}: Order has been delivered`;
            text =
                `Hi ${order.user.name},\n\n` +
                `Your items for Order #${order.orderId} have been delivered.\n\n` +
                `Thank you for your purchase!`;
            break;

        case "cancelled":
            subject = `Order #${order.orderId}: Cancellation request approved`;
            text =
                `Hi ${order.user.name},\n\n` +
                `Your cancellation request for Order #${order.orderId} has been approved.\n` +
                `This order has now been successfully cancelled.\n\n` +
                `If you have any questions, feel free to contact our support team.\n\n` +
                `Thank you.`;
            break;
        default:
            return { success: true, skipped: true };
    }

    html = getOrderStatusTemplate({
        name: order.user.name,
        orderId: order.orderId,
        status: order.status,
        trackingLink: order.trackingLink,
    });

    await sendEmail(userEmail, subject, text, html);
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
        `There has been an update to the tracking link for Order #${order.orderId}.\n\n` +
        `This is your new tracking link:\n${newLink}\n\n` +
        `Thanks!`;

    const html = getTrackingLinkChangeTemplate(
        order.user.name,
        order.orderId,
        newLink,
    );

    return await sendEmail(userEmail, subject, text, html);
};

module.exports = {
    sendEmail,
    sendOrderStatusEmail,
    sendTrackingLinkChangeEmail,
};
