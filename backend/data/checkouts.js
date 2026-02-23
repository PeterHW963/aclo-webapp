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
            addressDetails: "Details of Admin Street 123",
            city: "Jakarta",
            postalCode: "11234",
            phone: "081234567890",
            latitude: -6.2,
            longitude: 106.8,
        },

        paymentMethod: "BankTransfer",

        paymentProof: {
            publicId: "aclo/dev/payments/baskdpzqrt7gpqzzr5wm",
            uploadedAt: new Date(),
            status: "pending",
        },
        noteToSeller: "",

        shippingCost: 22500,
        shippingMethod: "Reguler",
        shippingCourier: "jne",
        shippingDuration: "1 - 2 days",

        subtotal: 599000,
        totalPrice: 621500,
        isPaid: true,

        isFinalized: true,
        finalizedAt: null,
    },
];

module.exports = checkouts;
