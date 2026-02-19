const orders = [
    {
        orderItems: [],

        shippingDetails: {
            name: "Admin User",
            address: "Admin Street 123",
            city: "Jakarta",
            postalCode: "11234",
            phone: "1234567890",
        },

        shippingCost: 22500,
        shippingMethod: "Same Day",
        shippingCourier: "anteraja",
        shippingDuration: "8 - 12 hours",

        paymentMethod: "BankTransfer",
        paymentProof: {
            publicId: "aclo/dev/payments/baskdpzqrt7gpqzzr5wm",
            uploadedAt: new Date(),
            status: "pending",
        },
        noteToSeller:
            "Please ensure that the packaging is water resistant in case of rain as I will not be home when the package arrives.",
        cancelRequest: {
            createdAt: new Date(),
            reason: "I decided that I will not be needing the Learning Tower.",
        },

        subtotal: 599000,
        totalPrice: 621500,
        isPaid: false,

        status: "pending",
    },
];

module.exports = orders;
