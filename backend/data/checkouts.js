const checkouts = [
    {
        checkoutItems: [
            {
                name: "SPARROW - Mini Foldable Learning Tower",
                image: "SPARROW-SNOW_psikau",
                price: 599000,
                options: { color: "Snow" },
                quantity: 1,
            },
        ],

        shippingDetails: {
            name: "Admin User",
            address: "Admin Street 123",
            city: "Jakarta",
            postalCode: "11234",
            phone: "1234567890",
        },

        paymentMethod: "BankTransfer",

        paymentProof: {
            publicId: "aclo/dev/payments/baskdpzqrt7gpqzzr5wm",
            uploadedAt: new Date(),
            status: "pending",
        },
        noteToSeller: "",

        shippingCost: 22500,
        shippingMethod: "Same Day",
        shippingCourier: "anteraja",
        shippingDuration: "8 - 12 hours",

        totalPrice: 621500,
        isPaid: false,

        isFinalized: false,
        finalizedAt: null,
    },
];

module.exports = checkouts;
