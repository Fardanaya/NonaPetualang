"use server";

import { metadataConfig } from '@/app/config';

// Server-side notification sending using Engagespot API
const ENGAGESPOT_API_KEY = process.env.NEXT_PUBLIC_ENGAGE_SPOT_API_KEY;
const ENGAGESPOT_API_SECRET = process.env.ENGAGESPOT_API_SECRET;

export const sendPushNotification = async (
    userIds: string[] | null,
    title: string,
    message: string,
    data?: any,
    url?: string
) => {
    try {
        if (!ENGAGESPOT_API_KEY || !ENGAGESPOT_API_SECRET) {
            console.warn("Engagespot API credentials not configured");
            return { success: false, error: "Notification service not configured" };
        }

        // If no specific users, skip sending
        if (!userIds || userIds.length === 0) {
            console.warn("No recipients specified for notification");
            return { success: false, error: "No recipients specified" };
        }

        // Send to each recipient via Engagespot API
        const promises = userIds.map(async (userId) => {
            const response = await fetch("https://api.engagespot.co/v3/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-ENGAGESPOT-API-KEY": ENGAGESPOT_API_KEY,
                    "X-ENGAGESPOT-API-SECRET": ENGAGESPOT_API_SECRET,
                },
                body: JSON.stringify({
                    notification: {
                        title,
                        message,
                        url,
                        data,
                    },
                    recipients: [userId],
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to send notification to ${userId}:`, errorText);
            }
            return response.ok;
        });

        await Promise.all(promises);
        return { success: true };
    } catch (error) {
        console.error("Failed to send push notification:", error);
        return { success: false, error: "Failed to send notification" };
    }
};

export const getAllAdmin = async () => {
    // Fetch all admin users to send notifications to
    // Using supabaseAdmin to bypass RLS
    const { supabaseAdmin } = await import('@/lib/supabase/admin');
    const supabase = await supabaseAdmin();

    try {
        const { data: admins, error } = await supabase
            .from('users')
            .select('id, email')
            .eq('is_admin', true);

        console.log("getAllAdmin query result:", { admins, error });

        if (error) throw error;

        const adminEmails = (admins as { email: string }[]).map(admin => admin.email);
        console.log("Admin emails found:", adminEmails);

        return adminEmails;
    } catch (error) {
        console.error("Failed to fetch admins:", error);
        return [];
    }
}

export const sendNotification = async (params: { data: any }) => {
    console.log("=== sendNotification called ===", params);

    const { data } = params;
    const { status } = data;
    let recipients: string[] = [];
    let payload = data.payload;

    const transactionNotificationTypes = [
        {
            status: "pending",
            title: "📄 Permintaan Sewa Baru",
            message: `Pesanan baru dari ${payload?.user?.full_name || ""} untuk alat ${payload?.catalog?.name || ""}`,
            recipient: "admin",
            url: "/admin/order/",
        },
        {
            status: "deposit",
            title: "💰 Deposit Baru Diterima",
            message: `Deposit sebesar Rp ${payload?.nominal?.toLocaleString("id-ID") || "0"} dari ${payload?.user?.full_name || ""} untuk alat ${payload?.catalog?.name || ""}`,
            recipient: "admin",
            url: "/admin/order/",
        },
        {
            status: "waiting",
            title: "📄 Permintaan Sewa Diterima",
            message: "Silahkan lakukan pembayaran",
            recipient: "user",
            url: "/order/",
        },
        {
            status: "dp",
            title: "💵 Pembayaran DP Diterima",
            message: `Pembayaran DP sebesar Rp ${payload?.nominal?.toLocaleString("id-ID") || "0"} telah diterima`,
            recipient: "admin",
            url: "/admin/order/",
        },
        {
            status: "paid",
            title: "💵 Pembayaran Lunas Diterima",
            message: `Pembayaran lunas sebesar Rp ${((payload?.final_price || 0) - (payload?.dp_payment?.nominal || 0)).toLocaleString("id-ID")} telah diterima`,
            recipient: "admin",
            url: "/admin/order/",
        },
        {
            status: "sending",
            title: "🚚 Barang kamu Sedang Dikirim",
            message: `Barang ${payload?.catalog?.name || ""} sedang dalam perjalanan ke alamat Kamu`,
            recipient: "user",
            url: "/order/",
        },
        {
            status: "returning",
            title: "🚚 Barang Sedang Dikembalikan",
            message: `Barang ${payload?.catalog?.name || ""} sedang dalam perjalanan kembali`,
            recipient: "admin",
            url: "/admin/order/",
        },
        {
            status: "settlement",
            title: "💥 Barang Bermasalah",
            message: `Terdapat kerusakan pada barang kamu\nSilahkan diskusi dengan admin untuk penyelesaian`,
            recipient: "user",
            url: "/order/",
        },
        {
            status: "done",
            title: "✅ Transaksi Selesai",
            message: `Terima kasih telah menyewa di ${metadataConfig.name}\nKami tunggu permintaan sewa selanjutnya 💖`,
            recipient: "user",
            url: "/order/",
        },
        {
            status: "reject",
            title: "❌ Permintaan Sewa Ditolak",
            message: `Maaf, permintaan sewa kamu ditolak oleh admin\nAlasan - ${payload?.reject_reason || ''}`,
            recipient: "user",
            url: "/order/",
        },
        {
            status: "cancel",
            title: "❌ Pesanan Dibatalkan",
            message: `Pesanan telah dibatalkan oleh customer\nAlasan - ${payload?.cancel_reason || ''}`,
            recipient: "admin",
            url: "/admin/order/",
        },
        {
            status: "priority",
            title: "⭐ Alat Priority Tersedia!",
            message: `Alat ${payload?.catalog?.name || ""} sekarang tersedia untuk sewa priority!\nSilahkan pilih alamat dan tanggal sewa kamu`,
            recipient: "user",
            url: "/order/priority/",
        }
    ];

    // Find notification config based on status
    const notificationConfig = transactionNotificationTypes.find(
        nt => nt.status === status
    );

    if (!notificationConfig) {
        console.warn(`No notification config found for status: ${status}`);
        return { success: false, error: "No notification config found" };
    }

    // Determine recipients
    if (notificationConfig.recipient === 'admin') {
        recipients = await getAllAdmin();
    } else if (notificationConfig.recipient === 'user' && payload?.user?.email) {
        recipients.push(payload.user.email);
    }

    // Generate notification content
    const title = notificationConfig.title;
    const message = notificationConfig.message;
    const baseUrl = process.env.NEXT_PUBLIC_URL || '';
    const url = `${baseUrl}${notificationConfig.url}${payload?.id || ''}`;

    console.log("Sending notification:", {
        status,
        recipientType: notificationConfig.recipient,
        recipients,
        title
    });

    return sendPushNotification(recipients, title, message, payload, url);
}
