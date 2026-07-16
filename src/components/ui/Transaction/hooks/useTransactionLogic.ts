"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDisclosure } from "@heroui/react";
import { useSession } from "@/components/providers/SessionProvider";
import { useTransaction, useCreateTransaction, getStatusIndex, transactionStatus, depositExtendedTransactionStatus } from "@/hooks/react-query/transaction";
import { useTransactionAddons, useCreateTransactionAddon } from "@/hooks/react-query/transaction-addon";
import { useShipping } from "@/stores/useShipping";
import { usePayment } from "@/stores/usePayment";
import { usePaymentAccounts } from "@/stores/usePaymentAccounts";
import { useAddress, useCreateOrUpdateAddress } from "@/hooks/react-query/address";
import { useAllAddons } from "@/hooks/react-query/addon";
import { sendNotification } from "@/lib/actions/notification";
import { fetchExpedition, fetchInstagram } from "@/lib/fetch";
import { displayToast } from "@/lib/utils";
import { sendPushNotification } from "@/lib/actions/notification";
import { createSnapToken } from "@/lib/actions/midtrans";
import { ITempShipping, Addons } from "../types";

export const useTransactionLogic = (type: "admin" | "user") => {
    const { id } = useParams();
    const router = useRouter();
    const [loadPage, setLoadPage] = useState(true);
    const { user: session } = useSession();

    // Transaction data
    const { data: transactionData, isLoading: loadingTransaction, refetch: refetchTransaction } = useTransaction(id as string);
    const { mutateAsync: createTransactionMutation } = useCreateTransaction({ silent: true });
    const [model, setModel] = useState<any>({});

    // Shipping
    const {
        loading: loadingShipping,
        model: modelShipping,
        setModel: setModelShipping,
        create: createShipping,
        getById: getByIdShipping,
    } = useShipping();

    // Payment
    const {
        loading: loadingPayment,
        create: createPayment,
        setModel: setModelPayment,
        model: modelPayment,
        getById: getByIdPayment,
    } = usePayment();

    // Addons
    const { data: listAddon = [], isLoading: loadingAddons, refetch: refetchAddons } = useTransactionAddons(id as string);
    const { mutateAsync: createAddon } = useCreateTransactionAddon({ silent: true });
    const { data: listAddons = [], isLoading: loadingAddonsDepo } = useAllAddons();
    const [addonsSelected, setAddonsSelected] = useState<Addons[]>([]);

    // Expedition
    const [listExpedition, setListExpedition] = useState<any[]>([]);
    const [loadingExpedition, setLoadingExpedition] = useState(false);

    // Payment accounts
    const {
        loading: loadingPaymentAccounts,
        list: listPaymentAccounts,
        getAll: getAllPaymentAccounts,
    } = usePaymentAccounts();

    // Address
    const { data: listAddress = [], isLoading: loadingAddress } = useAddress({
        user_id: session?.id
    });
    const { mutateAsync: createAddress } = useCreateOrUpdateAddress();
    const [modelAddress, setModelAddress] = useState<any>({});
    const [selectedAddress, setSelectedAddress] = useState<string>("");

    // Modals
    const { isOpen: isOpenReject, onOpen: onOpenReject, onOpenChange: onOpenChangeReject } = useDisclosure();
    const { isOpen: isOpenCancel, onOpen: onOpenCancel, onOpenChange: onOpenChangeCancel } = useDisclosure();
    const { isOpen: isOpenDataUser, onOpen: onOpenDataUser, onOpenChange: onOpenChangeDataUser } = useDisclosure();
    const { isOpen: isOpenAddons, onOpen: onOpenAddons, onOpenChange: onOpenChangeAddons } = useDisclosure();



    // Shipping states
    const [rTempShipping, setRTempShipping] = useState<ITempShipping>({ expedition: null, resi: "", price: 0 });
    const [sTempShipping, setSTempShipping] = useState<ITempShipping>({ expedition: null, resi: "", price: 0 });

    // Payment states
    const [paymentType, setPaymentType] = useState<"full" | "dp" | any>("full");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [DPAmount, setDPAmount] = useState(0);
    const [settlementAmount, setSettlementAmount] = useState(0);

    // Misc states
    const [isCopied, setIsCopied] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [rentDate, setRentDate] = useState<{ start: any; end: any }>({ start: null, end: null });
    const [sendingSteps, setSendingSteps] = useState<any[]>([]);
    const [returningSteps, setReturningSteps] = useState<any[]>([]);
    const [instagramData, setInstagramData] = useState<any>();

    // Helper functions
    const setModelTransaction = (newModel: any) => {
        setModel((prev: any) => ({ ...prev, ...newModel }));
    };

    const createTransaction = async (dataToSave?: any) => {
        const data = dataToSave || model;
        await createTransactionMutation(data);
        refetchTransaction();
    };

    const getById = (id: string) => refetchTransaction();
    const getByTransactionId = (id: string) => refetchAddons();

    const handleCopy = async (textToCopy: string) => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    // Subtotal calculations
    const getSubtotalCostume = () => Number(model?.catalog?.price) || 0;
    const getSubtotalAdditionalDay = () => (Number(model?.additional_day) || 0) * 50000;
    const getSubtotalAddons = () =>
        model.status === "priority"
            ? addonsSelected.reduce((sum, addon) => sum + (Number(addon.price) || 0) * (Number(addon.quantity) || 1), 0)
            : listAddon?.reduce((sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.qty) || 1), 0) || 0;
    const getSubtotalShipping = () => Number(model?.s_shipping?.price) || 0;
    const getSubtotalDiscount = () => Number(model?.discount?.amount) || 0;
    const getTotal = () => getSubtotalCostume() + getSubtotalAdditionalDay() + getSubtotalAddons() + getSubtotalShipping() - getSubtotalDiscount();

    // Addon handlers
    const handleDecrementAddon = (id: string) => {
        setAddonsSelected((prev) => {
            const idx = prev.findIndex((addon) => addon.id === id);
            if (idx === -1) return prev;
            const newQuantity = prev[idx].quantity - 1;
            if (newQuantity <= 0) return prev.filter((addon) => addon.id !== id);
            const updated = [...prev];
            updated[idx] = { ...updated[idx], quantity: newQuantity };
            return updated;
        });
    };

    const handleIncrementAddon = (id: string) => {
        const addon = listAddons?.find((a) => a.id === id);
        if (!addon) return;
        setAddonsSelected((prev) => {
            const idx = prev.findIndex((addon) => addon.id === id);
            if (idx === -1) return prev;
            const newQuantity = prev[idx].quantity + 1;
            if (newQuantity > (addon.stock || 0)) return prev;
            const updated = [...prev];
            updated[idx] = { ...updated[idx], quantity: newQuantity };
            return updated;
        });
    };

    const handleChangeAddonQuantity = (id: string, value: string) => {
        const addon = listAddons?.find((a) => a.id === id);
        if (!addon) return;
        const numValue = parseInt(value) || 0;
        if (numValue > (addon.stock || 0)) return;
        setAddonsSelected((prev) => {
            const idx = prev.findIndex((addon) => addon.id === id);
            if (idx === -1) return prev;
            if (numValue <= 0) return prev.filter((addon) => addon.id !== id);
            const updated = [...prev];
            updated[idx] = { ...updated[idx], quantity: numValue };
            return updated;
        });
    };

    const handleRemoveAddon = (id: string) => {
        setAddonsSelected((prev) => prev.filter((addon) => addon.id !== id));
    };

    const handleAddAddon = (item: any) => {
        setAddonsSelected((prev) => [...prev, { id: item.id || "", name: item.name || "", price: item.price || 0, quantity: 1 }]);
    };

    const isAddonSelected = (id: string) => addonsSelected.some((selected) => selected.id === id);
    const isAddonStockFull = (id: string, quantity: number) => {
        const addon = listAddons?.find((a) => a.id === id);
        return (addon?.stock || 0) <= quantity;
    };

    // Shipping handlers
    const handleSubmitShipping = async (shippingType: "send" | "return") => {
        try {
            const shippingId = shippingType === "send" ? model.s_shipping?.id : model.r_shipping?.id;
            if (!shippingId) return;

            const tempShipping = shippingType === "send" ? sTempShipping : rTempShipping;

            setModelShipping({
                id: shippingId,
                expedition: tempShipping.expedition,
                resi: tempShipping.resi,
                price: tempShipping.price,
            });

            const status = shippingType === "send" ? "sending" : "returning";

            await createShipping(true);
            const newModel = { ...model, status };
            setModelTransaction(newModel);
            await createTransaction(newModel);
            displayToast({ type: 'success', title: 'Success', description: `Berhasil Mengirim Resi ${shippingType === "send" ? "Pengiriman" : "Pengembalian"}!` });

            sendNotification({ data: { status, payload: model } });

            if (model.user?.id) {
                await sendPushNotification(
                    [model.user.id],
                    "Update Pengiriman",
                    `Status pesanan Anda sekarang: ${status === "sending" ? "Sedang Dikirim" : "Sedang Dikembalikan"}`
                );
            }
        } catch (error) {
            console.error("Failed to update sending:", error);
        }
    };

    const handleAcceptOrder = async () => {
        try {
            const sendShipping: any = await new Promise((resolve, reject) => {
                const data = createShipping(true);
                if (data) resolve(data);
                else reject(new Error("Failed to create sending shipping"));
            });

            const returnShipping: any = await new Promise((resolve, reject) => {
                const data = createShipping(true);
                if (data) resolve(data);
                else reject(new Error("Failed to create return shipping"));
            });

            const newModel = {
                id: model.id,
                final_price: model.final_price + sendShipping.price,
                s_shipping: sendShipping.id,
                r_shipping: returnShipping.id,
                status: "waiting",
            };

            setModelTransaction(newModel);
            createTransaction(newModel);
            displayToast({ type: 'success', title: 'Success', description: 'Berhasil Menerima Pesanan! Tunggu pembayaran dari user.' });

            sendNotification({ data: { status: "waiting", payload: model } });

            if (model.user?.id) {
                await sendPushNotification([model.user.id], "Pesanan Diterima", "Pesanan Anda telah diterima! Silakan lakukan pembayaran.");
            }
        } catch (error) {
            console.error("Failed to process transaction:", error);
        }
    };

    // Payment handler
    const handleSubmitPayment = async () => {
        try {
            const { createPaymentOnSuccess, updateTransactionPayment } = await import('@/lib/actions/midtrans-payment');

            const remainingAmount = model?.final_price - (Number(model?.deposit?.nominal ?? 0) + Number(model?.dp_payment?.nominal ?? 0));
            const isFromDpStatus = model?.status === "dp";
            const isFullPayment = isFromDpStatus || paymentType === "full";
            const paymentTypeValue: 'dp' | 'full' = isFromDpStatus ? "full" : (paymentType === "full" ? "full" : "dp");

            const grossAmount = isFromDpStatus
                ? remainingAmount
                : paymentType === "full"
                    ? remainingAmount
                    : Math.round((model?.final_price - (Number(model?.deposit?.nominal ?? 0))) * 0.5);

            // Generate order ID for Midtrans (don't save to DB yet)
            const midtransOrderId = `${model.id.substring(0, 8)}-${Date.now()}`;

            // Create snap token directly without saving to DB
            const token = await createSnapToken({
                order_id: midtransOrderId,
                gross_amount: grossAmount,
                transaction_id: model.id,
                customer_details: {
                    first_name: session?.user_metadata?.full_name || "Customer",
                    email: session?.email || "",
                    phone: session?.user_metadata?.phone_whatsapp || "",
                },
            });

            if (token) {
                // @ts-ignore
                window.snap.pay(token, {
                    onSuccess: async function (result: any) {
                        try {
                            // Only save payment to DB after successful payment
                            const payment = await createPaymentOnSuccess({
                                transaction_id: model.id,
                                nominal: grossAmount,
                                type: paymentTypeValue,
                                midtrans_order_id: midtransOrderId,
                                payment_method: result.payment_type,
                                proof: result.pdf_url || `Midtrans: ${result.transaction_id}`,
                            });

                            await updateTransactionPayment({
                                transaction_id: model.id,
                                payment_id: payment.id,
                                payment_type: paymentTypeValue,
                            });

                            refetchTransaction();
                            displayToast({
                                type: 'success',
                                title: 'Success',
                                description: isFromDpStatus ? 'Berhasil Melunasi Pembayaran!' : isFullPayment ? 'Berhasil Melakukan Pembayaran Lunas!' : 'Berhasil Melakukan Pembayaran DP!'
                            });

                            sendNotification({ data: { status: isFullPayment ? "paid" : "dp", payload: model } });

                            if (model.user?.id) {
                                await sendPushNotification([model.user.id], "Pembayaran Berhasil", `Pembayaran ${isFullPayment ? "Lunas" : "DP"} Anda telah diterima.`);
                            }
                        } catch (updateError) {
                            console.error("Error saving payment:", updateError);
                            displayToast({ type: 'danger', title: 'Error', description: 'Pembayaran berhasil tetapi gagal menyimpan. Hubungi admin.' });
                        }
                    },
                    onPending: function (result: any) {
                        displayToast({ type: 'warning', title: 'Pending', description: 'Pembayaran tertunda, silakan selesaikan dalam 1 jam.' });
                    },
                    onError: function (result: any) {
                        console.error("Payment error:", result);
                        displayToast({ type: 'danger', title: 'Error', description: 'Pembayaran gagal.' });
                    },
                    onClose: function () {
                        console.log("Customer closed the popup without finishing the payment");
                    },
                });
            }
        } catch (error) {
            console.error("Failed to process payment:", error);
            displayToast({ type: 'danger', title: 'Error', description: 'Gagal memproses pembayaran.' });
        }
    };

    // Image upload handler
    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("files", file);
            formData.append("type", "transaction");
            formData.append("id", model?.id || "");

            const uploadResponse = await fetch("/api/tools/image", { method: "POST", body: formData });
            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) throw new Error(uploadData.error || "Image upload failed");

            if (uploadData.success) {
                setModelPayment({ proof: uploadData.results[0].url });
                displayToast({ type: 'success', title: 'Success', description: 'Image uploaded successfully' });
            }
        } catch (error) {
            displayToast({ type: 'danger', title: 'Error', description: error instanceof Error ? error.message : "Image upload failed" });
        } finally {
            setUploadingImage(false);
        }
    };

    // Tracking fetch
    const getStepsFromTracking = async (expedition?: string, resi?: string) => {
        if (!expedition || !resi) return { steps: [], completed: false };

        try {
            const res = await fetch(`/api/expedition/track?expedition=${expedition}&trackingNumber=${resi}`);
            const result = await res.json();

            if (!res.ok || !result?.history?.length) return { steps: [], completed: false };

            return { steps: result.history, completed: result.status === "DELIVERED" };
        } catch (error) {
            return { steps: [], completed: false };
        }
    };

    const fetchInstagramData = useCallback(async (username: string) => {
        const data = await fetchInstagram(username);
        setInstagramData(data);
    }, []);

    // Submit priority order
    const handleSubmitPriorityOrder = async () => {
        const newModel = {
            id: model.id,
            address: modelAddress?.id || model.address?.id || model.address,
            start_rent: model.start_rent,
            end_rent: model.end_rent,
            additional_day: model.additional_day,
            final_price: getTotal(),
            status: "pending",
        };
        setModelTransaction(newModel);
        await createTransaction(newModel);

        for (const addon of addonsSelected) {
            await createAddon({
                transaction: model.id,
                add_on: addon.id,
                qty: addon.quantity,
                price: addon.price,
            });
        }
        displayToast({ type: 'success', title: 'Success', description: 'Berhasil submit order!' });

        if (model.user?.id) {
            await sendPushNotification([model.user.id], "Order Berhasil", "Order Anda berhasil dibuat!");
        }

        getById(model.id);
        getByTransactionId(model.id);
    };

    // Effects
    useEffect(() => {
        const loadExpeditions = async () => {
            setLoadingExpedition(true);
            const data = await fetchExpedition("");
            setListExpedition(data || []);
            setLoadingExpedition(false);
        };
        loadExpeditions();
    }, []);

    useEffect(() => {
        setLoadPage(false);
        getAllPaymentAccounts();
    }, []);

    useEffect(() => {
        if (id) {
            getById(id.toString());
            getByTransactionId(id.toString());
            getByIdPayment(id.toString());
        }
    }, [id]);

    useEffect(() => {
        if (transactionData) setModel(transactionData);
    }, [transactionData]);

    useEffect(() => {
        if (listAddress && listAddress.length > 0 && !model.address) {
            const defaultAddress = listAddress[0] || {};
            setModelTransaction({ address: defaultAddress?.id || "" });
            setModelAddress(defaultAddress);
        }
    }, [listAddress, model.address]);

    useEffect(() => {
        if (!loadingTransaction && !loadPage && model.id && model?.user?.id !== session?.id && type === "user") {
            router.back();
            displayToast({ type: 'danger', title: 'Error', description: 'Bukan punya kamu woii!' });
        }
    }, [model, type]);

    useEffect(() => {
        if (model.user?.instagram) fetchInstagramData(model.user?.instagram);
    }, [model]);

    useEffect(() => {
        if (model.dp_payment) setPaymentType("full");
    }, [model.dp_payment]);

    useEffect(() => {
        if (model.sett_payment && model.sett_payment.nominal >= 0) setSettlementAmount(model.sett_payment?.nominal);
    }, [model.sett_payment]);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    useEffect(() => {
        const fetchTracking = async () => {
            const sending = { expedition: model.s_shipping?.expedition?.code || model.s_shipping?.expedition, resi: model.s_shipping?.resi };
            const returning = { expedition: model.r_shipping?.expedition?.code || model.r_shipping?.expedition, resi: model.r_shipping?.resi };

            const shippingResult = await getStepsFromTracking(sending.expedition, sending.resi);
            setSendingSteps(shippingResult.steps);

            const rResult = await getStepsFromTracking(returning.expedition, returning.resi);
            setReturningSteps(rResult.steps);
        };

        fetchTracking();
    }, [model.s_shipping, model.r_shipping]);

    return {
        // Data
        model,
        setModel,
        setModelTransaction,
        loadingTransaction,
        loadPage,
        session,
        transactionData,
        refetchTransaction,
        createTransaction,
        getById,
        getByTransactionId,

        // Shipping
        modelShipping,
        setModelShipping,
        loadingShipping,
        createShipping,
        sTempShipping,
        setSTempShipping,
        rTempShipping,
        setRTempShipping,
        listExpedition,
        loadingExpedition,
        sendingSteps,
        returningSteps,
        handleSubmitShipping,

        // Payment
        modelPayment,
        setModelPayment,
        loadingPayment,
        createPayment,
        paymentType,
        setPaymentType,
        uploadingImage,
        DPAmount,
        setDPAmount,
        settlementAmount,
        setSettlementAmount,
        handleSubmitPayment,
        handleImageUpload,
        listPaymentAccounts,
        loadingPaymentAccounts,

        // Addons
        listAddon,
        loadingAddons,
        createAddon,
        listAddons,
        loadingAddonsDepo,
        addonsSelected,
        setAddonsSelected,
        handleDecrementAddon,
        handleIncrementAddon,
        handleChangeAddonQuantity,
        handleRemoveAddon,
        handleAddAddon,
        isAddonSelected,
        isAddonStockFull,

        // Address
        listAddress,
        loadingAddress,
        createAddress,
        modelAddress,
        setModelAddress,
        selectedAddress,
        setSelectedAddress,

        // Modals
        isOpenReject,
        onOpenReject,
        onOpenChangeReject,
        isOpenCancel,
        onOpenCancel,
        onOpenChangeCancel,
        isOpenDataUser,
        onOpenDataUser,
        onOpenChangeDataUser,
        isOpenAddons,
        onOpenAddons,
        onOpenChangeAddons,

        // Form states
        rejectReason,
        setRejectReason,
        cancelReason,
        setCancelReason,
        rentDate,
        setRentDate,
        isCopied,
        handleCopy,
        instagramData,

        // Handlers
        handleAcceptOrder,
        handleSubmitPriorityOrder,
        sendNotification,

        // Calculations
        getSubtotalCostume,
        getSubtotalAdditionalDay,
        getSubtotalAddons,
        getSubtotalShipping,
        getSubtotalDiscount,
        getTotal,
        getStatusIndex,
        transactionStatus,
        depositExtendedTransactionStatus,
    };
};
