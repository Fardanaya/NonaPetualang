"use server";

import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export const createSnapToken = async (transactionDetails: {
    order_id: string;
    gross_amount: number;
    transaction_id?: string; // Original transaction ID for redirect
    customer_details?: {
        first_name: string;
        last_name?: string;
        email: string;
        phone?: string;
    };
}) => {
    try {
        // Get base URL from environment or use localhost for development
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const redirectUrl = transactionDetails.transaction_id
            ? `${baseUrl}/order/${transactionDetails.transaction_id}`
            : baseUrl;

        const parameter = {
            transaction_details: {
                order_id: transactionDetails.order_id,
                gross_amount: transactionDetails.gross_amount,
            },
            customer_details: transactionDetails.customer_details,
            expiry: {
                unit: "minutes",
                duration: 60, // 1 hour expiry
            },
            callbacks: {
                finish: redirectUrl,
                error: redirectUrl,
                pending: redirectUrl,
            },
        };

        const token = await snap.createTransactionToken(parameter);
        return token;
    } catch (error) {
        console.error("Error creating Snap token:", error);
        throw error;
    }
};
