import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/actions/notification";

// Initialize Midtrans Core API for status check
const core = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const transactionId = searchParams.get("transaction_id");
        const midtransOrderId = searchParams.get("order_id"); // From Midtrans redirect URL

        console.log("Check status called with:", { transactionId, midtransOrderId });

        if (!transactionId) {
            return NextResponse.json(
                { error: "transaction_id is required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Get the transaction to check current status
        const { data: transaction, error: txError } = await supabase
            .from("transactions")
            .select("*")
            .eq("id", transactionId)
            .single();

        console.log("Transaction found:", transaction?.id, "Status:", transaction?.status);

        if (txError || !transaction) {
            console.error("Transaction error:", txError);
            return NextResponse.json(
                { error: "Transaction not found", details: txError },
                { status: 404 }
            );
        }

        // Find pending payments - try by transaction_id first, then by midtrans_order_id
        let pendingPayments: any[] = [];

        // Try to find by transaction_id
        const { data: paymentsByTx } = await supabase
            .from("payments")
            .select("*")
            .eq("transaction_id", transactionId);

        pendingPayments = paymentsByTx || [];
        console.log("Payments found by transaction_id:", pendingPayments.length);

        // If midtrans_order_id is provided and no payments found, try to find by midtrans_order_id
        if (midtransOrderId && pendingPayments.length === 0) {
            const { data: paymentsByOrderId } = await supabase
                .from("payments")
                .select("*")
                .eq("midtrans_order_id", midtransOrderId);

            pendingPayments = paymentsByOrderId || [];
            console.log("Payments found by midtrans_order_id:", pendingPayments.length);
        }

        let statusUpdated = false;
        let newStatus = transaction.status;

        // Check each pending payment with Midtrans
        for (const payment of pendingPayments) {
            console.log("Checking payment:", payment.id, "midtrans_order_id:", payment.midtrans_order_id, "status:", payment.status, "type:", payment.type);

            // If payment is already paid but transaction is still waiting or dp, update transaction
            if (payment.status === "paid" && (transaction.status === "waiting" || transaction.status === "dp")) {
                console.log("Payment already paid, updating transaction status...", { paymentType: payment.type, transactionStatus: transaction.status });
                const updateData: any = {};

                if (payment.type === "dp" && transaction.status === "waiting") {
                    // First DP payment
                    updateData.dp_payment_id = payment.id;
                    updateData.status = "dp";
                    newStatus = "dp";
                } else if (payment.type === "full") {
                    // Full payment or settlement after DP
                    updateData.payment_id = payment.id;
                    updateData.status = "paid";
                    newStatus = "paid";
                }

                if (Object.keys(updateData).length > 0) {
                    const { error: updateTxError } = await supabase
                        .from("transactions")
                        .update(updateData)
                        .eq("id", transactionId);

                    if (!updateTxError) {
                        statusUpdated = true;
                        console.log("Transaction updated to:", newStatus);

                        // Send notification to admin about payment
                        await sendNotification({
                            data: {
                                status: newStatus,
                                payload: { ...transaction, nominal: payment.nominal },
                            },
                        });
                    } else {
                        console.error("Error updating transaction:", updateTxError);
                    }
                }
                continue;
            }

            if (payment.midtrans_order_id && payment.status !== "paid") {
                try {
                    const midtransStatus = await core.transaction.status(payment.midtrans_order_id);
                    console.log("Midtrans status for", payment.midtrans_order_id, ":", midtransStatus.transaction_status);

                    if (midtransStatus.transaction_status === "settlement" ||
                        midtransStatus.transaction_status === "capture") {

                        // Update payment status
                        const { error: updatePaymentError } = await supabase
                            .from("payments")
                            .update({
                                status: "paid",
                                payment_method: midtransStatus.payment_type,
                                proof: midtransStatus.pdf_url || `Midtrans: ${midtransStatus.transaction_id}`,
                            })
                            .eq("id", payment.id);

                        if (updatePaymentError) {
                            console.error("Error updating payment:", updatePaymentError);
                        }

                        // Determine what to update on transaction
                        const updateData: any = {};

                        if (payment.type === "dp" && transaction.status === "waiting") {
                            // First DP payment
                            updateData.dp_payment_id = payment.id;
                            updateData.status = "dp";
                            newStatus = "dp";
                        } else if (payment.type === "full") {
                            // Full payment or settlement after DP
                            updateData.payment_id = payment.id;
                            updateData.status = "paid";
                            newStatus = "paid";
                        }

                        console.log("Updating transaction with:", updateData);

                        const { error: updateTxError } = await supabase
                            .from("transactions")
                            .update(updateData)
                            .eq("id", transactionId);

                        if (updateTxError) {
                            console.error("Error updating transaction:", updateTxError);
                        } else {
                            statusUpdated = true;
                            console.log("Transaction updated successfully to status:", newStatus);

                            // Send notification to admin about payment
                            await sendNotification({
                                data: {
                                    status: newStatus,
                                    payload: { ...transaction, nominal: payment.nominal },
                                },
                            });
                        }
                    } else if (midtransStatus.transaction_status === "expire" ||
                        midtransStatus.transaction_status === "cancel" ||
                        midtransStatus.transaction_status === "deny") {
                        // Handle expired, cancelled, or denied payments
                        console.log("Payment expired/cancelled/denied:", payment.midtrans_order_id);

                        const { error: updatePaymentError } = await supabase
                            .from("payments")
                            .update({
                                status: midtransStatus.transaction_status, // 'expire', 'cancel', or 'deny'
                            })
                            .eq("id", payment.id);

                        if (updatePaymentError) {
                            console.error("Error updating expired payment:", updatePaymentError);
                        } else {
                            console.log("Payment marked as:", midtransStatus.transaction_status);
                        }
                    }
                } catch (midtransError) {
                    console.error("Error checking Midtrans status:", midtransError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            statusUpdated,
            currentStatus: newStatus,
            transaction_id: transactionId,
            paymentsChecked: pendingPayments.length,
        });
    } catch (error) {
        console.error("Error checking payment status:", error);
        return NextResponse.json(
            { error: "Failed to check payment status", details: String(error) },
            { status: 500 }
        );
    }
}
