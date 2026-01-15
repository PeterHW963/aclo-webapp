const puppeteer = require("puppeteer");

/**
 * Generate shipping label in HTML from order data
 * TODO: Add shipping method
 */
const generateShippingLabelHTML = (order) => {
    // TODO: this will be hardcoded, replace with actual sender address
    const senderAddress = {
        name: "ACLO Kids",
        address: "Jl. Example Street No. 123",
        city: "KOTA JAKARTA UTARA",
        postalCode: "12345",
        phone: "+6282128528968",
    };

    // ACLO logo
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const logoPublicId = "ACLO_LOGO_HORIZONTAL-06_1_mdrbx8";
    const logoUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${logoPublicId}`;

    const orderDate = new Date(order.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    // return HTML string
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shipping Label - Order ${order.orderId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: white;
        }
        
        .label-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px dotted #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .logo-img {
            height: 32px;
            width: auto;
            object-fit: contain;
        }
        
        .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
            font-size: 12px;
        }
        
        .order-info-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 10px;
            border: 1px solid #000;
        }
        
        .order-info-item strong {
            font-weight: bold;
        }
        
        .addresses {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .address-box {
            border: 2px solid #000;
            padding: 15px;
        }
        
        .address-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        
        .address-content {
            font-size: 12px;
            line-height: 1.6;
        }
        
        .address-content p {
            margin: 3px 0;
        }
        
        .shipping-info {
            display: flex;
            justify-content: flex-end;
        }
        
        .shipping-box {
            border: 1px solid #000;
            padding: 10px;
            text-align: center;
        }
        
        .shipping-box-title {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .shipping-box-content {
            font-size: 12px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 11px;
        }
        
        .items-table th,
        .items-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }
        
        .items-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        .items-table td:last-child,
        .items-table th:last-child {
            text-align: center;
        }
        
        .footer {
            border-top: 2px dotted #000;
            padding-top: 10px;
            font-size: 11px;
            text-align: center;
        }
        
        .tracking-number {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin: 15px 0;
            padding: 10px;
            border: 2px solid #000;
        }
    </style>
</head>
<body>
    <div class="label-container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <img src="${logoUrl}" alt="ACLO logo" class="logo-img" />
            </div>
            <div class="shipping-info">
                <div class="shipping-box">
                    <div class="shipping-box-title">SHIPPING METHOD</div>
                    <div class="shipping-box-content">Standard Shipping</div>
                </div>
            </div>
        </div>
        
        <!-- Order Info -->
        <div class="order-info">
            <div class="order-info-item">
                <span><strong>Order ID:</strong></span>
                <span>${order.orderId}</span>
            </div>
            <div class="order-info-item">
                <span><strong>Order Date:</strong></span>
                <span>${orderDate}</span>
            </div>
        </div>
        
        <!-- Addresses -->
        <div class="addresses">
            <!-- Sender Address -->
            <div class="address-box">
                <div class="address-title">Sender (Pengirim)</div>
                <div class="address-content">
                    <p><strong>${senderAddress.name}</strong></p>
                    <p>${senderAddress.phone}</p>
                    <p>${senderAddress.address}</p>
                    <p>${senderAddress.city}, ${senderAddress.postalCode}</p>
                </div>
            </div>
            
            <!-- Recipient Address -->
            <div class="address-box">
                <div class="address-title">Recipient (Penerima)</div>
                <div class="address-content">
                    <p><strong>${order.shippingDetails.name}</strong></p>
                    <p>${order.shippingDetails.phone}</p>
                    <p>${order.shippingDetails.address}</p>
                    <p>${order.shippingDetails.city}, ${
        order.shippingDetails.postalCode
    }</p>
                </div>
            </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Variant</th>
                    <th>Qty</th>
                </tr>
            </thead>
            <tbody>
                ${order.orderItems
                    .map((item, index) => {
                        let variantText = "N/A";

                        if (item.productVariantId) {
                            const variant = item.productVariantId;
                            const variantParts = [];
                            if (variant.color) variantParts.push(variant.color);
                            if (variant.variant)
                                variantParts.push(variant.variant);
                            if (variantParts.length > 0)
                                variantText = variantParts.join(", ");
                        }

                        return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td>${variantText}</td>
                        <td>${item.quantity}</td>
                    </tr>
                `;
                    })
                    .join("")}
            </tbody>
        </table>
        
        <!-- Tracking Number -->
        <div class="tracking-number">
            Order #: ${order.orderId}
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>Weight: ${order.orderItems.reduce(
                (total, item) => total + (item.weight || 0) * item.quantity,
                0
            )}g | Total Items: ${order.orderItems.reduce(
        (total, item) => total + item.quantity,
        0
    )}</p>
            <p>This is an automated shipping label. Handle with care.</p>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Generate shipping label in PDF from order data
 */
const generateShippingLabelPDF = async (order) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        const html = generateShippingLabelHTML(order);

        await page.setContent(html, { waitUntil: "networkidle0" });
        await page.setViewport({ width: 800, height: 1200 });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "10mm",
                right: "10mm",
                bottom: "10mm",
                left: "10mm",
            },
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        if (browser) {
            await browser.close();
        }
        throw error;
    }
};

module.exports = { generateShippingLabelPDF };
