import { metadataConfig } from '@/app/config';
import { sendNotification, getAllAdmin } from '../lib/actions/notification'
import { create } from 'zustand'

interface INotificationStore {
    loading: boolean
    sendNotif: (params: {
        data?: any;
    }) => void
}

export const useNotification = create<INotificationStore>((set, get) => ({
    loading: false,
    sendNotif: async ({ data }) => {
        set({ loading: true });
        try {
            let recipients: string[] = [];
            let payload = data.payload;

            const transactionNotificationTypes = [
                {
                    status: "pending",
                    title: "📄 Permintaan Sewa Baru",
                    message: "",
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
                    message: `Pembayaran lunas sebesar Rp ${(payload?.final_price - payload?.dp_payment?.nominal).toLocaleString("id-ID") || "0"} telah diterima`,
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

            const notificationConfig = transactionNotificationTypes.find(
                nt => nt.status === data.status
            );

            if (notificationConfig) {
                if (notificationConfig.recipient === 'admin') {
                    recipients = await getAllAdmin();
                } else if (notificationConfig.recipient === 'user' && payload?.user?.email) {
                    recipients.push(payload.user.email);
                }

                payload = {
                    ...data.payload,
                    notification: {
                        title: notificationConfig.title,
                        message: notificationConfig.message,
                        url: `${process.env.NEXT_PUBLIC_URL}${notificationConfig.url}${payload?.id || ''}`
                    }
                };
            }

            await sendNotification({
                data: {
                    ...data,
                    payload,
                    recipients
                },
            });
        } catch (error) {
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },
}));
