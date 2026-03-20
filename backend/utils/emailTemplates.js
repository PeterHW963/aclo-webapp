// Base email template
const getBaseTemplate = (content) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const logoPublicId = "ACLO_LOGO_HORIZONTAL-06_1_mdrbx8";
    const logoUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${logoPublicId}`;
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ACLO</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                    <tr>
                        <td style="padding: 32px 40px 0; text-align: center;">
                            <img
                                src="${logoUrl}"
                                alt="ACLO logo"
                                width="160"
                                style="display: block; margin: 0 auto; height: auto; border: 0; outline: none; text-decoration: none;"
                            />
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e5e5e5; background-color: #fafafa; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; font-size: 12px; color: #666666; line-height: 1.5;">
                                © ${new Date().getFullYear()} ACLO. All rights reserved.<br>
                                This email was sent to you as part of your ACLO account activity.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
};

// Email verification template
const getVerificationEmailTemplate = (name, verificationUrl) => {
    const content = `
        <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #1a1a1a;">
            Welcome to ACLO! 👋
        </h2>
        
        <p style="margin: 0 0 20px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
            Hi ${name},
        </p>
        
        <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
            Thank you for registering! Please verify your email address by clicking the button below:
        </p>
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="text-align: center; padding: 0 0 24px;">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #00b7e8; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                        Verify Email Address
                    </a>
                </td>
            </tr>
        </table>
        
        <p style="margin: 0 0 16px; font-size: 14px; color: #666666; line-height: 1.6;">
            This link will expire in 24 hours.
        </p>
    `;

    return getBaseTemplate(content);
};

// Password reset template
const getPasswordResetTemplate = (resetUrl) => {
    const content = `
        <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #1a1a1a;">
            Reset Your Password
        </h2>
        
        <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
        </p>
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="text-align: center; padding: 0 0 24px;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #00b7e8; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                        Reset Password
                    </a>
                </td>
            </tr>
        </table>
        
        <p style="margin: 0 0 16px; font-size: 14px; color: #666666; line-height: 1.6;">
            This link will expire in 2 minutes.
        </p>
    `;

    return getBaseTemplate(content);
};

// Checkout reminder template
const getCheckoutReminderTemplate = (
    name,
    expiresAt,
    timeRemaining,
    paymentUrl,
) => {
    const formattedExpiry = new Date(expiresAt).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
        timeZoneName: "short",
    });

    const urgencyColor = timeRemaining === "1 hour" ? "#ff6b6b" : "#ffa726";

    const content = `
        <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #1a1a1a;">
            Reminder: Your Checkout Will Expire Soon
        </h2>
        
        <p style="margin: 0 0 20px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
            Hi ${name},
        </p>
        
        <p style="margin: 0 0 20px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
            Your checkout with ACLOKids will expire in <strong style="color: ${urgencyColor};">${timeRemaining}</strong>. 
            Please complete your checkout to confirm your order.
        </p>
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="text-align: center; padding: 0 0 24px;">
                    <a href="${paymentUrl}" style="display: inline-block; padding: 14px 32px; background-color: #00b7e8; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                        Complete Your Checkout
                    </a>
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 20px; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
            <strong>Your order will expire at:</strong>
            ${formattedExpiry}
        </p>
        
        <p style="margin: 0 0 16px; font-size: 14px; color: #666666; line-height: 1.6;">
            If you're having trouble clicking the button, copy and paste this URL into your browser:
        </p>
        <p style="margin: 0 0 16px; text-align:center; font-size: 14px; color: #00b7e8; word-break: break-all;">
            ${paymentUrl}
        </p>
    `;

    return getBaseTemplate(content);
};

// Order status change template
const getOrderStatusTemplate = ({ name, orderId, status, trackingLink }) => {
    // const normalizedStatus = (status || "").toLowerCase();

    let title = "";
    let intro = "";
    let body = "";
    let accentColor = "#00b7e8";

    switch (status) {
        case "pending":
            title = "Order Confirmation";
            intro = `Hi ${name},`;
            accentColor = "#ffa726";
            body = `
                <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                    Your order with <strong>Order ID #${orderId}</strong> has been placed successfully.
                </p>
                <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                    We have received your payment proof and your order is currently
                    <strong style="color: ${accentColor};">pending verification</strong>.
                </p>
                <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                    We'll notify you again once your payment has been reviewed.
                </p>
            `;
            break;

        case "processing":
            title = "Payment Accepted";
            intro = `Hi ${name},`;
            body = `
                <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                    Your payment proof for <strong>Order #${orderId}</strong> has been accepted.
                    Your order is now <strong style="color: ${accentColor};">Processing</strong>.
                </p>
            `;
            break;

        case "rejected":
            title = "Payment Rejected";
            intro = `Hi ${name},`;
            accentColor = "#ff6b6b";
            body = `
                <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                    Your payment proof for <strong>Order #${orderId}</strong> was
                    <strong style="color: ${accentColor};">rejected</strong>.
                </p>
                <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                    Please contact support for further clarification.
                </p>
            `;
            break;

        case "shipping":
            title = "Your order is on the way";
            intro = `Hi ${name},`;
            accentColor = "#ffa726";
            body = `
                <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                    Your items for <strong>Order #${orderId}</strong> have been passed to the shipping courier.
                </p>
                ${
                    trackingLink
                        ? `
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td style="text-align: center; padding: 0 0 24px;">
                            <a href="${trackingLink}" style="display: inline-block; padding: 14px 32px; background-color: #00b7e8; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                                Track Your Order
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="margin: 0 0 16px; font-size: 14px; color: #666666; line-height: 1.6;">
                    If you're having trouble clicking the button, copy and paste this URL into your browser:
                </p>
                <p style="margin: 0 0 16px; text-align:center; font-size: 14px; color: #00b7e8; word-break: break-all;">
                    ${trackingLink}
                </p>
                `
                        : `
                <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                    Tracking information will be shared once available.
                </p>
                `
                }
            `;
            break;

        case "delivered":
            title = "Order Delivered";
            intro = `Hi ${name},`;
            accentColor = "#4caf50";
            body = `
                <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                    Your items for <strong>Order #${orderId}</strong> have been
                    <strong style="color: ${accentColor};">delivered</strong>.
                </p>
                <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                    Thank you for your purchase!
                </p>
            `;
            break;

        case "cancelled":
            title = "Cancellation Approved";
            intro = `Hi ${name},`;
            accentColor = "#9e9e9e";
            body = `
                <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                    Your request to cancel <strong>Order #${orderId}</strong> has been approved.
                </p>
            `;
            break;

        default:
            return null;
    }

    const content = `
        <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #1a1a1a;">
            ${title}
        </h2>

        <p style="margin: 0 0 20px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
            ${intro}
        </p>

        ${body}
    `;

    return getBaseTemplate(content);
};

// Tracking link updated template
const getTrackingLinkChangeTemplate = (name, orderId, newLink) => {
    const content = `
        <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #1a1a1a;">
            Tracking Link Updated
        </h2>

        <p style="margin: 0 0 20px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
            Hi ${name},
        </p>

        <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
            There has been an update to the tracking link for <strong>Order #${orderId}</strong>.
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="text-align: center; padding: 0 0 24px;">
                    <a href="${newLink}" style="display: inline-block; padding: 14px 32px; background-color: #00b7e8; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                        View Updated Tracking Link
                    </a>
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 16px; font-size: 14px; color: #666666; line-height: 1.6;">
            If you're having trouble clicking the button, copy and paste this URL into your browser:
        </p>
        <p style="margin: 0 0 16px; text-align:center; font-size: 14px; color: #00b7e8; word-break: break-all;">
            ${newLink}
        </p>
    `;

    return getBaseTemplate(content);
};

module.exports = {
    getVerificationEmailTemplate,
    getPasswordResetTemplate,
    getCheckoutReminderTemplate,
    getOrderStatusTemplate,
    getTrackingLinkChangeTemplate,
};
