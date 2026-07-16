"use client";

import { CatalogCalendar } from "@/components/ui/Calendar";
import { fromDate } from "@internationalized/date";
import {
  Button,
  Chip,
  Input,
  Modal,
  NumberInput,
  Skeleton,
} from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import {
  depositExtendedTransactionStatus,
  getStatusIndex,
  transactionStatus,
  useTransaction,
  useCreateTransaction,
} from "@/hooks/react-query/transaction";
import { useTransactionAddons, useCreateTransactionAddon } from "@/hooks/react-query/transaction-addon";
import {
  Accordion,
  AccordionItem,
  Alert,
  Autocomplete,
  AutocompleteItem,
  cn,
  Divider,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  ScrollShadow,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { FaCalendarAlt, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";
import {
  FaAngleRight,
  FaBox,
  FaCalendar,
  FaCalendarPlus,
  FaCalendarXmark,
  FaCheck,
  FaCopy,
  FaMinus,
  FaMoneyBillWave,
  FaPlus,
  FaTent,
  FaTrash,
  FaUser,
} from "react-icons/fa6";
import {
  MdDiscount,
  MdOutlinePersonalVideo,
  MdOutlinePersonPin,
} from "react-icons/md";
import { useCreateOrUpdateShipping } from "@/hooks/react-query/shipping";
import { usePayment } from "@/stores/usePayment";
import { fetchExpedition } from "@/lib/fetch";
import { Stepper } from "@/components/ui/Stepper";
import { ShippingStepper } from "@/components/ui/ShippingStepper";
import TextEditor from "@/components/ui/TextEditor";
import { set } from "date-fns";
import { usePaymentAccounts } from "@/stores/usePaymentAccounts";
import { fetchInstagram } from "@/lib/fetch";
import { TbBrandWhatsappFilled } from "react-icons/tb";
import { RiInstagramFill } from "react-icons/ri";
import { restoreAddOnStock } from "@/lib/addonStock";
import SkeletonRentUser from "@/components/ui/Skeleton/RentUser/SkeletonRentUser";
import { useSession } from "@/components/providers/SessionProvider";
import { sendNotification, sendPushNotification } from "@/lib/actions/notification";
import { formatToLocale, displayToast, calcRentalPrice } from "@/lib/utils";

import { HiSpeakerphone } from "react-icons/hi";
import { metadataConfig } from "@/app/config";
import { useAddress, useCreateOrUpdateAddress } from "@/hooks/react-query/address";
import { useAllAddons } from "@/hooks/react-query/addon";
import moment from "moment";
import AddonCard from "@/components/ui/Card/AddOn";

import { createSnapToken } from "@/lib/actions/midtrans";
import { createOrUpdate as createPenalty } from "@/lib/actions/penality";
import { IAddress } from "@/lib/types/schemas/address";
interface ITempShipping {
  expedition: any;
  resi: string;
  price: number;
}

interface Addons {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const AddressRadio = (props: any) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex max-w-full m-0 bg-content1 hover:bg-content2 items-center justify-between",
          "cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary"
        ),
        labelWrapper: "w-full",
        label: "font-semibold text-sm md:text-medium",
      }}
    >
      {children}
    </Radio>
  );
};

const Transaction = ({ type }: { type: "admin" | "user" }) => {
  const { id } = useParams();
  const router = useRouter();
  const [loadPage, setLoadPage] = useState(true);
  const { user: session } = useSession();
  const { data: transactionData, isLoading: loadingTransaction, refetch: refetchTransaction } = useTransaction(id as string);
  // Use silent mode for hooks that are part of a larger flow
  const { mutateAsync: createTransactionMutation } = useCreateTransaction({ silent: true });
  const [model, setModel] = useState<any>({});

  const setModelTransaction = (newModel: any) => {
    setModel((prev: any) => ({ ...prev, ...newModel }));
  };

  const createTransaction = async (dataToSave?: any) => {
    const data = dataToSave || model;
    await createTransactionMutation(data);
    refetchTransaction();
  };

  const getById = (id: string) => {
    refetchTransaction();
  };

  const getAllTransaction = () => {
    // Not implemented/needed for single transaction view
  };

  const list: any[] = []; // Placeholder if list is used

  // Use React Query mutation for shipping
  const { mutateAsync: createOrUpdateShipping } = useCreateOrUpdateShipping({ silent: true });
  const {
    loading: loadingPayment,
    create: createPayment,
    setModel: setModelPayment,
    model: modelPayment,
    getById: getByIdPayment,
  } = usePayment();
  const { data: listAddon = [], isLoading: loadingAddons, refetch: refetchAddons } = useTransactionAddons(id as string);
  // Use silent mode for addon hook as it's part of a larger flow
  const { mutateAsync: createAddon } = useCreateTransactionAddon({ silent: true });

  const getByTransactionId = (id: string) => {
    refetchAddons();
  };

  const getByIdAddon = (id: string) => {
    // Not implemented
  };
  const [listExpedition, setListExpedition] = useState<any[]>([]);
  const [loadingExpedition, setLoadingExpedition] = useState(false);
  const [modelExpedition, setModelExpedition] = useState<any>({});

  useEffect(() => {
    const loadExpeditions = async () => {
      setLoadingExpedition(true);
      const data = await fetchExpedition("");
      setListExpedition(data || []);
      setLoadingExpedition(false);
    };
    loadExpeditions();
  }, []);

  const {
    loading: loadingPaymentAccounts,
    list: listPaymentAccounts,
    getAll: getAllPaymentAccounts,
  } = usePaymentAccounts();

  const { data: listAddress = [], isLoading: loadingAddress } = useAddress({
    user_id: session?.id
  });
  const { mutateAsync: createAddress } = useCreateOrUpdateAddress();
  const [modelAddress, setModelAddress] = useState<any>({});

  const {
    isOpen: isOpenReject,
    onOpen: onOpenReject,
    onOpenChange: onOpenChangeReject,
  } = useDisclosure();

  // Cancel modal
  const {
    isOpen: isOpenCancel,
    onOpen: onOpenCancel,
    onOpenChange: onOpenChangeCancel,
  } = useDisclosure();

  const {
    isOpen: isOpenDataUser,
    onOpen: onOpenDataUser,
    onOpenChange: onOpenChangeDataUser,
  } = useDisclosure();



  const [rTempShipping, setRTempShipping] = useState<ITempShipping>({
    expedition: null,
    resi: "",
    price: 0,
  });

  const [sTempShipping, setSTempShipping] = useState<ITempShipping>({
    expedition: null,
    resi: "",
    price: 0,
  });

  const [paymentType, setPaymentType] = useState<"full" | "dp" | any>("full");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [DPAmount, setDPAmount] = useState(0);
  const [settlementAmount, setSettlementAmount] = useState(0);
  const [rejectReason, setRejectReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [rentDate, setRentDate] = useState<{
    start: any;
    end: any;
  }>({
    start: null,
    end: null,
  });

  const [sendingSteps, setSendingSteps] = useState<any[]>([]);
  const [returningSteps, setReturningSteps] = useState<any[]>([]);

  const [instagramData, setInstagramData] = useState<any>();

  const fetchInstagramData = useCallback(async (username: string) => {
    const data = await fetchInstagram(username);
    setInstagramData(data);
  }, []);

  const { data: listAddons = [], isLoading: loadingAddonsDepo } = useAllAddons();
  const [addonsSelected, setAddonsSelected] = useState<Addons[]>([]);
  const {
    isOpen: isOpenAddons,
    onOpen: onOpenAddons,
    onOpenChange: onOpenChangeAddons,
  } = useDisclosure();

  useEffect(() => {
    setLoadPage(false);
    getAllPaymentAccounts();
  }, []);

  // Removed useEffect for address fetching as it is now handled by React Query

  useEffect(() => {
    if (id) {
      getById(id.toString());
      getByTransactionId(id.toString());
      getByIdPayment(id.toString());
    }
  }, [id]);

  useEffect(() => {
    if (transactionData) {
      setModel(transactionData);
    }
  }, [transactionData]);

  useEffect(() => {
    if (listAddress && listAddress.length > 0 && !model.address) {
      const defaultAddress = listAddress[0] || {};
      setModelTransaction({ address_id: defaultAddress?.id || "" });
      setModelAddress(defaultAddress);
    }
  }, [listAddress, model.address]);

  // validasi cuma user tersebut dan admin yang bisa akses
  useEffect(() => {
    if (
      !loadingTransaction &&
      !loadPage &&
      model.id &&
      model?.user?.id !== session?.id &&
      type === "user"
    ) {
      // diback sama dikasih toast
      router.back();
      displayToast({ type: 'danger', title: 'Error', description: 'Bukan punya kamu woii!' });
      return;
    }
  }, [model, id, type]);

  useEffect(() => {
    if (model.user?.instagram) fetchInstagramData(model.user?.instagram);
  }, [model]);

  useEffect(() => {
    if (model.dp_payment) {
      setPaymentType("full");
    }
  }, [model.dp_payment]);

  useEffect(() => {
    if (model.sett_payment && model.sett_payment.nominal >= 0)
      setSettlementAmount(model.sett_payment?.nominal);
  }, [model.sett_payment]);

  useEffect(() => {
    // Load Midtrans Snap Script
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const getRentDays = () => {
    let diffDays = 1;
    if (model?.start_rent && model?.end_rent) {
      const startDate = moment(model.start_rent).startOf("day");
      const endDate = moment(model.end_rent).startOf("day");
      diffDays = endDate.diff(startDate, "days") + 1;
    }
    const additionalDays = Number(model?.additional_day) || 0;
    const totalDays = (diffDays > 0 ? diffDays : 1) + additionalDays;
    return totalDays > 0 ? totalDays : 1;
  };

  const getSubtotalCostume = () => {
    const days = getRentDays();
    if (model?.catalogs && model.catalogs.length > 0) {
      return model.catalogs.reduce(
        (sum: number, cat: any) => sum + calcRentalPrice(
          cat?.price_per_day || cat?.price || 0,
          cat?.prices,
          days
        ),
        0
      );
    }
    // Fallback to single catalog for backward compatibility
    return calcRentalPrice(
      model?.catalog?.price_per_day || model?.catalog?.price || 0,
      model?.catalog?.prices,
      days
    );
  };

  const getSubtotalAdditionalDay = () => 0; // Handled by getRentDays

  const getSubtotalAddons = () =>
    model.status === "priority"
      ? addonsSelected.reduce(
        (sum, addon) =>
          sum + (Number(addon.price) || 0) * (Number(addon.quantity) || 1),
        0
      )
      : listAddon?.reduce(
        (sum, item) =>
          sum + (Number(item?.price) || 0) * (Number(item?.qty) || 1),
        0
      ) || 0;

  const getSubtotalAccessories = () => {
    const days = getRentDays();
    // Sum all accessory prices from accessories array
    if (model?.accessories && model.accessories.length > 0) {
      return model.accessories.reduce(
        (sum: number, acc: any) => sum + (Number(acc?.price) || 0) * days,
        0
      );
    }
    return 0;
  };

  const getSubtotalAccessoriesAdditionalDay = () => 0; // Handled by getRentDays

  const getSubtotalShipping = () => Number(model?.s_shipping?.price) || 0;

  const getSubtotalDiscount = () => {
    if (!model?.discount) return 0;

    // Use discount_value for percentage/fixed type vouchers
    const discountValue = model.discount.discount_value || model.discount.amount || 0;
    const discountType = model.discount.discount_type;

    if (discountType === 'percentage') {
      const subtotalForDiscount =
        getSubtotalCostume() +
        getSubtotalAdditionalDay() +
        getSubtotalAddons() +
        getSubtotalAccessories() +
        getSubtotalAccessoriesAdditionalDay();
      return Math.floor((subtotalForDiscount * discountValue) / 100);
    } else {
      // Fixed amount
      return discountValue;
    }
  };

  const getTotal = () =>
    getSubtotalCostume() +
    getSubtotalAdditionalDay() +
    getSubtotalAddons() +
    getSubtotalAccessories() +
    getSubtotalAccessoriesAdditionalDay() +
    getSubtotalShipping() -
    getSubtotalDiscount();

  const handleSubmitShipping = async (type: "send" | "return") => {
    try {
      // Handle both cases: shipping can be an object with id, or just a string id
      const shippingRef = type === "send" ? model.s_shipping : model.r_shipping;
      const shippingId = typeof shippingRef === 'string' ? shippingRef : shippingRef?.id;

      console.log("handleSubmitShipping called", { type, shippingRef, shippingId });

      if (!shippingId) {
        displayToast({
          type: 'warning',
          title: 'Warning',
          description: 'Data shipping belum tersedia. Pastikan pesanan sudah diterima.'
        });
        return;
      }

      const tempShipping = type === "send" ? sTempShipping : rTempShipping;

      // Validate required fields
      if (!tempShipping.expedition || !tempShipping.resi) {
        displayToast({
          type: 'warning',
          title: 'Warning',
          description: 'Silakan pilih kurir dan masukkan nomor resi'
        });
        return;
      }

      // Only include price if explicitly set (non-zero), to avoid overwriting existing price
      const shippingData: any = {
        id: shippingId,
        expedition: tempShipping.expedition,
        resi: tempShipping.resi,
      };

      // Only update price if explicitly provided (greater than 0)

      console.log("Saving shipping data", shippingData);

      const status = type === "send" ? "sending" : "returning";

      // Use React Query mutation to save shipping data
      const result = await createOrUpdateShipping(shippingData);
      console.log("Shipping update result:", result);

      if (!result) {
        displayToast({
          type: 'danger',
          title: 'Error',
          description: 'Gagal menyimpan data pengiriman'
        });
        return;
      }

      // Only update necessary fields to avoid issues
      const updateData = { id: model.id, status };
      console.log("Updating transaction with:", updateData);

      setModelTransaction(updateData);
      await createTransaction(updateData);

      displayToast({
        type: 'success', title: 'Success', description: `Berhasil Mengirim Resi ${type === "send" ? "Pengiriman" : "Pengembalian"
          }!`
      });

      sendNotification({
        data: {
          status: status,
          payload: model,
        },
      });

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
      // Get shipping price from input (default 0 if not set)
      const shippingPrice = Number(sTempShipping.price) || 0;

      // Create shipping record for sending with price
      const sendShipping = await createOrUpdateShipping({
        price: shippingPrice,
      });
      if (!sendShipping) {
        throw new Error("Failed to create sending shipping");
      }

      // Create shipping record for returning
      const returnShipping = await createOrUpdateShipping({});
      if (!returnShipping) {
        throw new Error("Failed to create return shipping");
      }

      const newModel = {
        id: model.id,
        final_price: (Number(model.final_price) || 0) + shippingPrice,
        s_shipping: sendShipping.id,
        r_shipping: returnShipping.id,
        status: "waiting",
      };

      setModelTransaction(newModel);

      createTransaction(newModel);
      displayToast({ type: 'success', title: 'Success', description: 'Berhasil Menerima Pesanan! Tunggu pembayaran dari user.' });

      sendNotification({
        data: {
          status: "waiting",
          payload: model,
        },
      });

      if (model.user?.id) {
        await sendPushNotification(
          [model.user.id],
          "Pesanan Diterima",
          "Pesanan Anda telah diterima! Silakan lakukan pembayaran."
        );
      }
    } catch (error) {
      console.error("Failed to process transaction:", error);
    }
  };

  const handleSubmitPayment = async (inputPaymentType?: "dp" | "full" | "settlement") => {
    try {
      // Import server actions
      const { createPaymentOnSuccess, updatePaymentOnSuccess, updateTransactionPayment } = await import('@/lib/actions/midtrans-payment');

      // Determine payment type
      let type: "dp" | "full" | "settlement" = "full";
      let amountToPay = 0;
      let midtransOrderId = "";

      if (inputPaymentType === 'settlement' || model.status === 'settlement' || (model.penalty?.price > 0 && !model.sett_payment_id)) {
        type = "settlement";
        amountToPay = Number(model.penalty?.price) || Number(model.sett_payment?.nominal) || 0;
        midtransOrderId = `${model.id.substring(0, 8)}-SETT-${Date.now()}`;
      } else {
        const remainingAmount = model?.final_price - (Number(model?.deposit?.nominal ?? 0) + Number(model?.dp_payment?.nominal ?? 0));
        const isFromDpStatus = model?.status === "dp";

        type = isFromDpStatus ? "full" : (paymentType === "full" ? "full" : "dp");
        amountToPay = isFromDpStatus
          ? remainingAmount
          : paymentType === "full"
            ? remainingAmount
            : Math.round((model?.final_price - (Number(model?.deposit?.nominal ?? 0))) * 0.5);

        midtransOrderId = `${model.id.substring(0, 8)}-${Date.now()}`;
      }

      if (amountToPay <= 0) {
        displayToast({ type: 'warning', title: 'Warning', description: 'Nominal pembayaran tidak valid.' });
        return;
      }

      // Create snap token directly without saving to DB
      const token = await createSnapToken({
        order_id: midtransOrderId,
        gross_amount: amountToPay,
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
            console.log("Payment success:", result);

            try {
              let paymentId = "";

              if (type === 'settlement' && model.sett_payment_id) {
                // Update existing payment
                const payment = await updatePaymentOnSuccess({
                  id: model.sett_payment_id,
                  status: 'paid',
                  payment_method: result.payment_type,
                  proof: result.pdf_url || `Midtrans: ${result.transaction_id}`,
                  midtrans_order_id: midtransOrderId,
                  nominal: amountToPay,
                });
                paymentId = payment.id;
              } else {
                // Only save payment to DB after successful payment
                const payment = await createPaymentOnSuccess({
                  transaction_id: model.id,
                  nominal: amountToPay,
                  type: type,
                  midtrans_order_id: midtransOrderId,
                  payment_method: result.payment_type,
                  proof: result.pdf_url || `Midtrans: ${result.transaction_id}`,
                });
                paymentId = payment.id;
              }

              // Update transaction status
              await updateTransactionPayment({
                transaction_id: model.id,
                payment_id: paymentId,
                payment_type: type,
              });

              // Optimistically update local state
              if (type === 'settlement') {
                setModelTransaction({ status: 'done', sett_payment_id: paymentId });
              } else if (type === 'full') {
                setModelTransaction({ status: 'paid', payment_id: paymentId });
              } else if (type === 'dp') {
                setModelTransaction({ status: 'dp', dp_payment_id: paymentId });
              }

              // Refresh data from server to be sure
              refetchTransaction();

              const successMessage = type === 'settlement'
                ? 'Berhasil Melakukan Pembayaran Settlement!'
                : type === 'full'
                  ? 'Berhasil Melakukan Pembayaran Lunas!'
                  : 'Berhasil Melakukan Pembayaran DP!';

              displayToast({
                type: 'success',
                title: 'Success',
                description: successMessage
              });

              sendNotification({
                data: {
                  status: type === 'settlement' ? "done" : (type === "full" ? "paid" : "dp"),
                  payload: { ...model, status: type === 'settlement' ? "done" : model.status },
                },
              });

              if (model.user?.id) {
                await sendPushNotification(
                  [model.user.id],
                  "Pembayaran Berhasil",
                  `Pembayaran sebesar Rp ${amountToPay.toLocaleString('id-ID')} telah diterima.`
                );
              }
            } catch (updateError) {
              console.error("Error saving payment:", updateError);
              displayToast({ type: 'danger', title: 'Error', description: 'Pembayaran berhasil tetapi gagal menyimpan. Hubungi admin.' });
            }
          },
          onPending: function (result: any) {
            console.log("Payment pending:", result);
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



  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("type", "transaction");
      formData.append("id", model?.id || "");

      const uploadResponse = await fetch("/api/tools/image", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Image upload failed");
      }

      if (uploadData.success) {
        setModelPayment({
          proof: uploadData.results[0].url,
        });
        displayToast({ type: 'success', title: 'Success', description: 'Image uploaded successfully' });
      }
    } catch (error) {
      console.error("Upload error:", error);
      displayToast({ type: 'danger', title: 'Error', description: error instanceof Error ? error.message : "Image upload failed" });
    } finally {
      setUploadingImage(false);
    }
  };

  const getStepsFromTracking = async (expedition?: string, resi?: string) => {
    if (!expedition || !resi) return { steps: [], completed: false };

    try {
      const res = await fetch(
        `https://api.weebdev.my.id/expedition/waybill?expedition=${expedition}&trackingNumber=${resi}`
      );
      const result = await res.json();

      // Check if response has data with history
      if (!res.ok || !result?.data?.history?.length)
        return { steps: [], completed: false };

      // Map the response to expected format { date, desc }
      const steps = result.data.history.map((item: any) => ({
        date: item.tanggal ? new Date(item.tanggal.replace(" ", "T")) : null,
        desc: item.keterangan || "",
      }));

      return {
        steps,
        completed: result.data.packageStatus === "Delivered",
      };
    } catch (error) {
      console.error("Gagal fetch tracking:", error);
      return { steps: [], completed: false };
    }
  };

  // Helper functions untuk versi editable
  const handleDecrementAddon = (id: string) => {
    setAddonsSelected((prev) => {
      const idx = prev.findIndex((addon) => addon.id === id);
      if (idx === -1) return prev;
      const newQuantity = prev[idx].quantity - 1;
      if (newQuantity <= 0) {
        return prev.filter((addon) => addon.id !== id);
      }
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
      if (numValue <= 0) {
        return prev.filter((addon) => addon.id !== id);
      }
      const updated = [...prev];
      updated[idx] = { ...updated[idx], quantity: numValue };
      return updated;
    });
  };

  const handleRemoveAddon = (id: string) => {
    setAddonsSelected((prev) => prev.filter((addon) => addon.id !== id));
  };

  const handleAddAddon = (item: any) => {
    setAddonsSelected((prev) => [
      ...prev,
      {
        id: item.id || "",
        name: item.name || "",
        price: item.price || 0,
        quantity: 1,
      },
    ]);
  };

  const isAddonSelected = (id: string) => {
    return addonsSelected.some((selected) => selected.id === id);
  };

  const isAddonStockFull = (id: string, quantity: number) => {
    const addon = listAddons?.find((a) => a.id === id);
    return (addon?.stock || 0) <= quantity;
  };

  // function to get expedition icon from listExpedition
  const getExpeditionIcon = (expeditionData: any) => {
    if (!expeditionData) return "/placeholder.jpeg";

    // If expedition is already an object with icon
    if (typeof expeditionData === "object" && expeditionData?.icon) {
      return expeditionData.icon;
    }

    // If expedition is a string (code/id), find it from listExpedition
    const expeditionCode = typeof expeditionData === "object"
      ? expeditionData?.code || expeditionData?.id
      : expeditionData;

    const foundExpedition = listExpedition?.find(
      (exp) => exp.id === expeditionCode || exp.code === expeditionCode || exp.name?.toLowerCase() === expeditionCode?.toLowerCase()
    );

    return foundExpedition?.icon || "/placeholder.jpeg";
  };

  // Helper function to get expedition name
  const getExpeditionName = (expeditionData: any) => {
    if (!expeditionData) return "N/A";

    if (typeof expeditionData === "object" && expeditionData?.name) {
      return expeditionData.name;
    }

    const expeditionCode = typeof expeditionData === "object"
      ? expeditionData?.code || expeditionData?.id
      : expeditionData;

    const foundExpedition = listExpedition?.find(
      (exp) => exp.id === expeditionCode || exp.code === expeditionCode
    );

    return foundExpedition?.name || expeditionCode || "N/A";
  };

  useEffect(() => {
    const fetchTracking = async () => {
      const sending = {
        expedition:
          model.s_shipping?.expedition?.code || model.s_shipping?.expedition,
        resi: model.s_shipping?.resi,
      };

      const returning = {
        expedition:
          model.r_shipping?.expedition?.code || model.r_shipping?.expedition,
        resi: model.r_shipping?.resi,
      };

      const shippingResult = await getStepsFromTracking(
        sending.expedition,
        sending.resi
      );
      setSendingSteps(shippingResult.steps);

      const rResult = await getStepsFromTracking(
        returning.expedition,
        returning.resi
      );
      setReturningSteps(rResult.steps);
    };

    fetchTracking();
  }, [model.s_shipping, model.r_shipping]);

  console.log("model", model);

  // Tambahkan di atas komponen Transaction
  const handleSubmitPriorityOrder = async ({
    model,
    modelAddress,
    addonsSelected,
    setModelTransaction,
    createTransaction,
    createAddon,
    getTotal,
    getById,
    getByTransactionId,
    listAddon,
  }: any) => {
    // Update transaction fields
    const newModel = {
      id: model.id,
      address_id: modelAddress?.id || model.address?.id || model.address_id,
      start_rent: model.start_rent,
      end_rent: model.end_rent,
      additional_day: model.additional_day,
      final_price: getTotal(),
      status: "pending",
    };
    setModelTransaction(newModel);
    await createTransaction(newModel);

    // Tambahkan addon baru
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
      await sendPushNotification(
        [model.user.id],
        "Order Berhasil",
        "Order Anda berhasil dibuat!"
      );
    }

    // Refresh data
    getById(model.id);
    getByTransactionId(model.id);
  };

  return (
    <div className="py-4 flex flex-col gap-4">
      {loadingTransaction || loadPage ? (
        <div>
          <SkeletonRentUser type="order" />
        </div>
      ) : (
        <>
          <Section className="py-4 relative overflow-x-auto md:overflow-hidden">
            {model?.cancel_reason || model?.reject_reason ? (
              <div className="flex items-center gap-4 px-4 ">
                <div className="bg-danger px-4 py-1 rounded-lg">
                  {model.cancel_reason && "Canceled"}
                  {model.reject_reason && "Rejected"}
                </div>
                <div>{model.cancel_reason || model.reject_reason}</div>
              </div>
            ) : (
              <Stepper
                steps={
                  model?.deposit
                    ? depositExtendedTransactionStatus
                    : transactionStatus
                }
                activeStep={getStatusIndex(
                  model.status || "pending",
                  model?.deposit
                    ? depositExtendedTransactionStatus
                    : transactionStatus
                )}
                completed={model.status === "done"}
              />
            )}
          </Section>

          {getStatusIndex(model.status) >= 4 && getStatusIndex(model.status) <= 5 && type === "user" && (
            <Alert color="warning" icon={<HiSpeakerphone />} isClosable={true}>
                Jangan lupa ngirim bukti unboxing ketika alat sudah sampai dan
                ketika pengembalian 👉👈
            </Alert>
          )}

          <Section className="px-4 py-3 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between gap-2">
                <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                  <FaUser className="text-primary" />
                  <p>Penyewa / Penerima</p>
                </div>

                {type === "user" && (
                  <Button
                    color="primary"
                    // startContent={<BsChatFill />}
                    onPress={() => {
                      const message = encodeURIComponent(
                        `halo kak , aku mau ngirim bukti unboxing alat ${model?.catalog?.name}`
                      );
                      window.open(
                        `https://wa.me/${metadataConfig.contact.whatsapp}?text=${message}`
                      );
                    }}
                  >
                    Hubungi Admin
                  </Button>
                )}

                {type === "admin" && (
                  <Button color="primary" onPress={onOpenDataUser}>
                    Lihat data penyewa
                  </Button>
                )}

                <Modal
                  isOpen={isOpenDataUser}
                  onOpenChange={onOpenChangeDataUser}
                  size="full"
                >
                  <ModalContent>
                    <ModalBody>
                      <div className="flex flex-col w-full h-full max-h-[100vh] overflow-y-auto gap-2 pt-4">
                        <Tabs aria-label="Foto" className="w-full">
                          <Tab key="identity" title="Identitas">
                            <div className="flex flex-col md:flex-row gap-4 w-full">
                              <div className="w-full md:w-1/2 flex flex-col gap-2">
                                <p className="text-sm font-medium text-primary text-center">
                                  Foto Identitas
                                </p>
                                <div className="relative w-full aspect-[4/3] min-h-[150px] border rounded-lg overflow-hidden">
                                  <Image
                                    alt="Identity"
                                    className="object-cover"
                                    src={
                                      model?.user?.identity_pict ||
                                      "/placeholder.jpeg"
                                    }
                                    fill
                                  />
                                </div>
                              </div>
                            </div>
                          </Tab>
                        </Tabs>
                      </div>
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col text-xs md:text-sm">
                  <p className="font-semibold flex gap-2 items-center">
                    <FaUser className="text-primary" />
                    {model.user?.full_name || "-"}
                  </p>
                  <div className="flex flex-row gap-3 items-center">
                  </div>
                  <p className="font-medium flex gap-2 items-center">
                    <TbBrandWhatsappFilled className="text-primary" />
                    {model.user?.phone_whatsapp || "-"}
                  </p>
                </div>
              </div>
            </div>

            {type === "user" && model.status === "priority" ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                  <FaMapMarkerAlt className="text-primary" />
                  <p>Alamat</p>
                </div>
                {!listAddress || listAddress.length === 0 ? (
                  <Button
                    isIconOnly
                    onClick={() => router.push("/profile")}
                    aria-label="Tambah Alamat"
                    variant="flat"
                    color="primary"
                  >
                    <FaPlus />
                  </Button>
                ) : (
                  <Accordion>
                    <AccordionItem
                      classNames={{ trigger: "py-0" }}
                      key="address"
                      aria-label="Address"
                      indicator={<FaAngleRight className="text-primary" />}
                      title={
                        <p className="font-semibold text-sm md:text-medium">
                          {modelAddress?.label || "-"}
                        </p>
                      }
                      subtitle={
                        <div className="text-[0.6rem] md:text-xs">
                          <p className="font-semibold">
                            {modelAddress?.address}
                          </p>
                          <p className="font-medium">
                            {modelAddress?.address_details}
                          </p>
                        </div>
                      }
                    >
                      <RadioGroup
                        isRequired
                        value={model?.address || ""}
                        onValueChange={(value) => {
                          setModelTransaction({ address_id: value });
                          setModelAddress(
                            listAddress?.find(
                              (modelCatalog?: any) => modelCatalog?.id === value
                            )
                          );
                        }}
                      >
                        {listAddress?.map((modelCatalog?: IAddress) => (
                          <AddressRadio
                            description={
                              <div className="text-[0.6rem] md:text-xs">
                                <p className="font-semibold">
                                  {modelCatalog?.address}
                                </p>
                                <p className="font-medium">
                                  {modelCatalog?.address_details}
                                </p>
                              </div>
                            }
                            value={modelCatalog?.id || ""}
                            key={modelCatalog?.id || ""}
                          >
                            {modelCatalog?.label}
                          </AddressRadio>
                        ))}
                      </RadioGroup>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                  <FaMapMarkerAlt className="text-primary" />
                  <p>Alamat</p>
                </div>

                <p className="font-semibold text-sm md:text-medium">
                  {model.address?.label || (model.address_id ? "-" : "Ambil Sendiri (Pickup)")}
                </p>
                {model.address ? (
                  <div className="text-[0.6rem] md:text-xs">
                    <p className="font-semibold">{model.address?.address}</p>
                    <p className="font-medium">
                      {model.address?.address_details}
                    </p>
                  </div>
                ) : (
                  !model.address_id && (
                    <div className="text-[0.6rem] md:text-xs text-default-500">
                      <p className="font-semibold">Gudang Utama Nona Petualang</p>
                      <p className="font-medium">Jl. Veteran No. 123, Pasir Kaliki, Bandung</p>
                    </div>
                  )
                )}
              </div>
            )}
          </Section>
          {getStatusIndex(model.status || "pending") >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Section className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                  <FaTent className="text-primary" />
                  <p>Pengiriman</p>
                </div>
                <div>
                  {model.s_shipping?.expedition && model.s_shipping?.resi ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-end items-center gap-2">
                        <Tooltip
                          content={isCopied ? "Copied!" : "Copy to clipboard"}
                        >
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => handleCopy(model.s_shipping?.resi)}
                            aria-label={
                              isCopied ? "Copied!" : "Copy to clipboard"
                            }
                            isDisabled={isCopied}
                          >
                            {isCopied ? <FaCheck /> : <FaCopy />}
                          </Button>
                        </Tooltip>
                        <div className="flex flex-col items-end">
                          <p className="text-md font-semibold leading-none capitalize">
                            {model.s_shipping?.expedition || "N/A"}
                          </p>
                          <div className="flex gap-2 items-center">
                            <p className="text-xs font-semibold leading-none">
                              {model.s_shipping?.resi || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Image
                            src={getExpeditionIcon(model.s_shipping?.expedition)}
                            alt={getExpeditionName(model.s_shipping?.expedition)}
                            width={35}
                            height={35}
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                      <ScrollShadow
                        hideScrollBar
                        className="flex flex-col gap-2 md:px-4 h-[300px]"
                      >
                        <ShippingStepper steps={sendingSteps} />
                      </ScrollShadow>
                    </div>
                  ) : (
                    type === "user" && (
                      <div>
                        <p>Admin belum melakukan pengiriman</p>
                      </div>
                    )
                  )}
                  <div>
                    {type === "admin" &&
                      (!model.s_shipping?.expedition ||
                        !model.s_shipping?.resi) && (
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col md:flex-row gap-2">
                            <Autocomplete
                              fullWidth
                              color="primary"
                              label="Kurir"
                              radius="sm"
                              labelPlacement="outside"
                              placeholder="Cari kurir..."
                              className="md:max-w-[40%]"
                              defaultItems={listExpedition}
                              selectedKey={sTempShipping.expedition || null}
                              onSelectionChange={(key) => {
                                setSTempShipping({
                                  ...sTempShipping,
                                  expedition: key as string,
                                });
                              }}
                            >
                              {(item: any) => (
                                <AutocompleteItem key={item.id} textValue={item.name}>
                                  <div className="flex items-center gap-2">
                                    {item.icon && (
                                      <Image
                                        src={item.icon}
                                        alt={item.name}
                                        width={24}
                                        height={24}
                                        className="rounded object-contain"
                                      />
                                    )}
                                    <span>{item.name}</span>
                                  </div>
                                </AutocompleteItem>
                              )}
                            </Autocomplete>
                            <Input
                              label="Resi"
                              value={sTempShipping.resi}
                              onChange={(e) =>
                                setSTempShipping({
                                  ...sTempShipping,
                                  resi: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onPress={() => {
                                handleSubmitShipping("send");
                              }}
                            >
                              Simpan Resi
                            </Button>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </Section>

              <Section className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                  <FaTent className="text-primary" />
                  <p>Pengembalian</p>
                </div>
                <div>
                  {model.r_shipping?.resi ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-end items-center gap-2">
                        <Tooltip
                          content={isCopied ? "Copied!" : "Copy to clipboard"}
                        >
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => handleCopy(model.r_shipping?.resi)}
                            aria-label={
                              isCopied ? "Copied!" : "Copy to clipboard"
                            }
                            isDisabled={isCopied}
                          >
                            {isCopied ? <FaCheck /> : <FaCopy />}
                          </Button>
                        </Tooltip>
                        <div className="flex flex-col items-end">
                          <p className="text-md font-semibold leading-none capialize">
                            {model.r_shipping?.expedition || "N/A"}
                          </p>
                          <div className="flex gap-2 items-center">
                            <p className="text-xs font-semibold leading-none">
                              {model.r_shipping?.resi || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Image
                            src={getExpeditionIcon(model.r_shipping?.expedition)}
                            alt={getExpeditionName(model.r_shipping?.expedition)}
                            width={35}
                            height={35}
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                      <ScrollShadow
                        hideScrollBar
                        className="flex flex-col gap-2 md:px-4 h-[300px]"
                      >
                        <ShippingStepper steps={returningSteps} />
                      </ScrollShadow>
                    </div>
                  ) : (
                    type === "admin" && (
                      <div>
                        <p>User belum melakukan pengembalian</p>
                      </div>
                    )
                  )}
                  <div>
                    {type === "user" &&
                      (!model.r_shipping?.expedition ||
                        !model.r_shipping?.resi) && (
                        <>
                          {/* Show placeholder if admin hasn't set up sending shipping yet */}
                          {(!model.s_shipping?.expedition || !model.s_shipping?.resi) ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                              <p className="text-sm text-default-500">
                                Menunggu admin menginput pengiriman terlebih dahulu
                              </p>
                              <p className="text-xs text-default-400 mt-1">
                                Anda dapat mengisi resi pengembalian setelah barang dikirim
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-col md:flex-row gap-2">
                                <Autocomplete
                                  fullWidth
                                  color="primary"
                                  label="Kurir"
                                  radius="sm"
                                  labelPlacement="outside"
                                  placeholder="Cari kurir..."
                                  className="md:max-w-[40%]"
                                  defaultItems={listExpedition}
                                  selectedKey={rTempShipping.expedition || null}
                                  onSelectionChange={(key) => {
                                    setRTempShipping({
                                      ...rTempShipping,
                                      expedition: key as string,
                                    });
                                  }}
                                >
                                  {(item: any) => (
                                    <AutocompleteItem key={item.id} textValue={item.name}>
                                      <div className="flex items-center gap-2">
                                        {item.icon && (
                                          <Image
                                            src={item.icon}
                                            alt={item.name}
                                            width={24}
                                            height={24}
                                            className="rounded object-contain"
                                          />
                                        )}
                                        <span>{item.name}</span>
                                      </div>
                                    </AutocompleteItem>
                                  )}
                                </Autocomplete>
                                <Input
                                  label="Resi"
                                  value={rTempShipping.resi}
                                  onChange={(e) =>
                                    setRTempShipping({
                                      ...rTempShipping,
                                      resi: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  onPress={() => {
                                    handleSubmitShipping("return");
                                  }}
                                >
                                  Simpan Resi
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                  </div>
                </div>
              </Section>
            </div>
          )}

          <Section className="px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                <FaTent className="text-primary" />
                <p>Item Rental</p>
              </div>
              <Chip size="sm" variant="flat" color="primary">
                {(model.catalogs?.length || 0) + (model.accessories?.length || 0)} item
              </Chip>
            </div>
            <div className="space-y-3">
              {/* Display all catalog items */}
              {(model.catalogs || [model.catalog]).filter(Boolean).map((catalog: any, idx: number) => {
                // Get accessories for this catalog
                const catalogAccessories = model.accessories?.filter(
                  (acc: any) => acc.catalog_id === catalog?.id
                ) || [];

                return (
                  <div key={catalog?.id || idx} className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 md:gap-4 p-2 rounded-lg bg-default-50">
                      <div className="relative w-[80px] md:w-[120px] aspect-square flex-shrink-0">
                        <Image
                          src={catalog?.images?.[0] ?? "/placeholder.jpeg"}
                          alt={catalog?.name || "-"}
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div className="flex flex-col">
                          <p className="text-xs md:text-medium font-medium line-clamp-1">
                            {catalog?.name}
                          </p>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <div className="flex flex-row items-center gap-1">
                              <MdOutlinePersonalVideo className="text-[0.65rem] md:text-xs flex-shrink-0" />
                              <p className="text-[0.6rem] md:text-xs line-clamp-1 italic leading-tight">
                                {catalog?.characters?.series?.name ?? "-"}
                              </p>
                            </div>
                            <div className="flex flex-row items-center gap-1">
                              <MdOutlinePersonPin className="text-[0.65rem] md:text-xs flex-shrink-0" />
                              <p className="text-[0.6rem] md:text-xs line-clamp-1 italic leading-tight">
                                {catalog?.characters?.name ?? "-"}
                              </p>
                            </div>
                            {!catalog?.is_bundle && catalog?.brands?.name && (
                              <div className="flex flex-row items-center gap-1">
                                <MdDiscount className="text-[0.65rem] md:text-xs flex-shrink-0" />
                                <p className="text-[0.6rem] md:text-xs line-clamp-1 italic leading-tight">
                                  {catalog?.brands?.name}
                                </p>
                              </div>
                            )}
                          </div>
                          {/* Chip LD & LP */}
                          {(catalog?.min_lingkar_dada || catalog?.min_lingkar_pinggang) && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {catalog?.min_lingkar_dada && (
                                <Chip variant="bordered" size="xss" type="size">
                                  LD: {catalog.min_lingkar_dada} - {catalog.max_lingkar_dada || "-"}
                                </Chip>
                              )}
                              {catalog?.min_lingkar_pinggang && (
                                <Chip variant="bordered" size="xss" type="size">
                                  LP: {catalog.min_lingkar_pinggang} - {catalog.max_lingkar_pinggang || "-"}
                                </Chip>
                              )}
                            </div>
                          )}
                          {/* Baris Size & Gender */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {catalog?.is_bundle && (
                              <Chip variant="bordered" size="xss" bundle="yes">
                                Bundle
                              </Chip>
                            )}
                            {!catalog?.is_bundle && (
                              <>
                                <Chip variant="bordered" size="xss" type="size">
                                  {catalog?.selected_size || catalog?.size || "?"}
                                </Chip>
                                <Chip
                                  variant="bordered"
                                  size="xss"
                                  gender={(catalog?.gender || "unisex") as "male" | "female" | "unisex"}
                                >
                                  {catalog?.gender || "unisex"}
                                </Chip>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-[0.7rem] md:text-sm text-primary mt-1">
                          Rp {formatToLocale(catalog?.price || 0)} / Hari
                        </p>
                      </div>
                    </div>

                    {/* Accessories for this catalog item */}
                    {catalogAccessories.length > 0 && (
                      <div className="ml-4 flex flex-col gap-1">
                        {catalogAccessories.map((acc: any) => (
                          <div
                            key={acc.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-primary-50 border border-primary-100"
                          >
                            {acc.images && acc.images.length > 0 && (
                              <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                  src={acc.images[0]}
                                  alt={acc.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{acc.name}</p>
                              <p className="text-xs text-primary font-semibold">
                                Rp {(acc.price || 0).toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Generic Accessories (no catalog_id) */}
              {model.accessories?.filter((acc: any) => !acc.catalog_id).length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-xs font-semibold text-default-500 uppercase tracking-wide">
                    Aksesoris Umum
                  </p>
                  {model.accessories
                    ?.filter((acc: any) => !acc.catalog_id)
                    .map((acc: any) => (
                      <div
                        key={acc.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-default-100"
                      >
                        {acc.images && acc.images.length > 0 && (
                          <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={acc.images[0]}
                              alt={acc.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{acc.name}</p>
                          <p className="text-sm text-primary font-semibold">
                            Rp {(acc.price || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </Section>

          <div className="flex flex-col md:flex-row gap-4">
            <Section className="px-4 py-3 flex flex-col gap-2 md:w-[40%]">
              <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                <FaCalendar className="text-primary" />
                <p>Tanggal Pemakaian</p>
              </div>

              {model.status === "priority" ? (
                <div className="flex flex-col gap-4">
                  <div className="mx-auto">
                    <div className="flex flex-col items-center mb-2">
                      <p className="font-semibold text-sm md:text-base text-primary">
                        Ketersediaan Tanggal
                      </p>
                    </div>
                    <CatalogCalendar
                      isDateUnavailable={(date) => {
                        const isUnavailable = list.some((transaction) => {
                          if (
                            transaction?.status === "reject" ||
                            transaction?.status === "cancel"
                          )
                            return false;
                          if (
                            !transaction?.start_rent ||
                            !transaction?.end_rent
                          )
                            return false;
                          const start = fromDate(
                            new Date(transaction?.start_rent),
                            "Asia/Jakarta"
                          );
                          const end = fromDate(
                            new Date(transaction?.end_rent),
                            "Asia/Jakarta"
                          );
                          return (
                            date.compare(start) >= 0 && date.compare(end) <= 0
                          );
                        });
                        const today = fromDate(new Date(), "Asia/Jakarta");
                        const isPast = date.compare(today) < 0;
                        return isUnavailable || isPast;
                      }}

                      date={
                        model?.start_rent && model?.end_rent
                          ? {
                            start: fromDate(
                              new Date(model?.start_rent),
                              "Asia/Jakarta"
                            ),
                            end: fromDate(
                              new Date(model?.end_rent),
                              "Asia/Jakarta"
                            ),
                          }
                          : undefined
                      }
                      onRangeChange={(range) => {
                        if (range && range.start && range.end) {
                          const startDate = range.start.toDate("Asia/Jakarta");
                          const endDate = range.end.toDate("Asia/Jakarta");
                          const diffDays =
                            moment(endDate).diff(moment(startDate), "days") + 1;
                          let additional_day = 0;
                          if (diffDays > 3) {
                            additional_day = diffDays - 3;
                          }
                          setModelTransaction({
                            ...model,
                            start_rent: startDate,
                            end_rent: endDate,
                            additional_day: additional_day || 0,
                          });
                        }
                      }}
                    />
                    <div className="mt-2 text-xs text-default-600 text-center">
                      <span className="line-through">1</span> = Tanggal dicoret
                      berarti sudah disewa dan tidak tersedia.
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 md:gap-2 w-full">
                    <div className="flex flex-row items-center gap-2">
                      <div className="flex flex-row justify-between md:items-end text-xs md:text-sm w-full">
                        <p className="font-semibold text-default-900">Start</p>
                        <p className="font-medium text-default-900">
                          {model?.start_rent
                            ? new Date(model.start_rent).toDateString()
                            : "-"}
                        </p>
                      </div>
                      <FaCalendarAlt className="text-primary text-medium md:text-xl" />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <div className="flex flex-row justify-between md:items-end text-xs md:text-sm w-full">
                        <p className="font-semibold text-default-900">End</p>
                        <p className="font-medium text-default-900">
                          {model?.end_rent
                            ? new Date(model.end_rent).toDateString()
                            : "-"}
                        </p>
                      </div>
                      <FaCalendarXmark className="text-primary text-medium md:text-xl" />
                    </div>

                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="mx-auto">
                    <CatalogCalendar
                      date={{
                        start: fromDate(
                          new Date(model?.start_rent ?? new Date()),
                          "Asia/Jakarta"
                        ),
                        end: fromDate(
                          new Date(model?.end_rent ?? new Date()),
                          "Asia/Jakarta"
                        ),
                      }}
                      isReadOnly
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:gap-2 w-full">
                    <div className="flex flex-row items-center gap-2">
                      <div className="flex flex-row justify-between md:items-end text-xs md:text-sm w-full">
                        <p className="font-semibold text-default-900">Start</p>
                        <p className="font-medium text-default-900">
                          {model?.start_rent
                            ? new Date(model?.start_rent).toDateString()
                            : "-"}
                        </p>
                      </div>
                      <FaCalendarAlt className="text-primary text-medium md:text-xl" />
                    </div>

                    <div className="flex flex-row items-center gap-2">
                      <div className="flex flex-row justify-between md:items-end text-xs md:text-sm w-full">
                        <p className="font-semibold text-default-900">End</p>
                        <p className="font-medium text-default-900">
                          {model?.end_rent
                            ? new Date(
                              new Date(model?.end_rent).setDate(
                                new Date(model?.end_rent).getDate()
                              )
                            ).toDateString()
                            : "-"}
                        </p>
                      </div>
                      <FaCalendarXmark className="text-primary text-medium md:text-xl" />
                    </div>

                    {model?.additional_day > 0 && (
                      <div className="flex flex-row justify-center items-center gap-2">
                        <div className="flex flex-row justify-between items-center text-xs md:text-sm w-full">
                          <p className="font-semibold text-default-900">
                            Tambahan
                          </p>
                          <p className="font-medium text-default-900">
                            {model.additional_day} Hari
                          </p>
                        </div>
                        <FaCalendarPlus className="text-primary text-medium md:text-xl" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Section>

          </div>

          {/* {[1, 2].includes(getStatusIndex(model.status || "")) && (
            <div className="flex flex-row gap-2 w-full">
              {type === "user" && (
                <>
                  <Section className="px-4 py-3 flex flex-col gap-2 w-full">
                    {!model.dp_payment && (
                      <RadioGroup
                        orientation="horizontal"
                        defaultValue="full"
                        className="mb-2"
                        name="paymentType"
                        onChange={(e) => setPaymentType(e.target.value)}
                      >
                        <div className="flex flex-col">
                          <Radio value="dp">
                            Down Payment (Minimal 50% : Rp{" "}
                            {(
                              model?.final_price -
                              Number(model?.deposit?.nominal ?? 0) -
                              Math.round(
                                (model?.final_price -
                                  Number(model?.deposit?.nominal ?? 0)) *
                                0.5
                              )
                            ).toLocaleString("id-ID")}
                            )
                          </Radio>
                          <Radio value="full">Full Payment</Radio>
                        </div>
                      </RadioGroup>
                    )}

                    {type === "user" && model?.status === "waiting" && (
                      <div className="flex flex-col gap-2">
                        <p className="font-semibold text-sm mb-1">
                          Nominal Down Payment
                        </p>
                        <NumberInput
                          placeholder="Nominal DP"
                          hideStepper
                          value={model?.dp_payment?.nominal}
                          onChange={(e) =>
                            setModelPayment({
                              ...modelPayment,
                              nominal: Number(e) || 0,
                            })
                          }
                          className="w-full"
                        />
                      </div>
                    )}

                    {getStatusIndex(model.status) === 2 && (
                      <p>
                        Harap Selesaikan Pelunasan H-7 Sebesar Rp{" "}
                        {(
                          model?.final_price -
                          Number(model?.deposit?.nominal ?? 0) -
                          Number(model?.dp_payment?.nominal ?? 0)
                        ).toLocaleString("id-ID")}
                      </p>
                    )}


                  </Section>
                </>
              )}
            </div>
          )} */}

          <div className="flex flex-col md:flex-row gap-4">
            {getStatusIndex(model.status) >= 6 && (
              <Section className="px-4 py-3 flex flex-col gap-2 md:w-full">
                <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                  <FaBox className="text-primary" />
                  <p>Settlement</p>
                </div>
                {type === "user" && (
                  <div className="flex flex-col gap-2">
                    {!model.sett_payment_id && !model.penalty && (
                      <div className="flex flex-col gap-2 justify-center items-center">
                        <p className="text-xs">
                          {model.status !== "done"
                            ? "Admin belum memberikan alasan settlement"
                            : "Kostum kembali dengan aman tanpa kerusakan & keterlambatan"}
                        </p>
                      </div>
                    )}

                    {(model.penalty?.details) && (
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-xs">Alasan Settlement</p>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: model.penalty?.details,
                          }}
                        />
                      </div>
                    )}

                    {(model.penalty?.price > 0) && (
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-xs">Biaya Settlement</p>
                        <p className="text-sm">
                          Rp{" "}
                          {Number(model.penalty?.price).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    )}

                    {/* FORM PAYMENT SETTLEMENT */}
                    {model.sett_payment_id && (
                      <div className="mt-4 border-t border-dashed border-default-300 pt-4 flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold text-sm">Status Pembayaran</p>
                            <Chip
                              size="sm"
                              color={model.sett_payment?.status === 'paid' ? "success" : "warning"}
                              variant="flat"
                            >
                              {model.sett_payment?.status === 'paid' ? "Lunas" : "Belum Lunas"}
                            </Chip>
                          </div>
                          {model.sett_payment?.payment_method && (
                            <div className="flex justify-between items-center text-xs text-default-500">
                              <p>Metode: {model.sett_payment.payment_method}</p>
                            </div>
                          )}
                        </div>

                        {model.sett_payment?.status === 'paid' && (
                          <div className="p-3 bg-success-50 rounded-lg flex items-center gap-2 text-success-700 text-sm">
                            <FaCheck className="text-success" />
                            <p className="font-medium">Pembayaran Settlement Telah Diterima</p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* {model?.sett_payment &&
                      (model?.sett_payment?.proof ? (
                        <div className="flex flex-col gap-2">
                          <p className="font-semibold text-sm mb-1">
                            Bukti Pembayaran
                          </p>
                          <div className="flex items-center gap-2">
                            <Image
                              src={
                                model.sett_payment.proof ||
                                "https://placehold.co/150"
                              }
                              alt={model.sett_payment.payment_method}
                              width={250}
                              height={250}
                              className="rounded-lg"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>

                        </div>
                      ))} */}
                  </div>
                )}
                {type === "admin" && (
                  <>
                    {model.status === "done" && !model.sett_payment_id ? (
                      // Case 1: No settlement required (Done and no settlement)
                      <div className="flex flex-col gap-2 justify-center items-center">
                        <p className="text-xs">
                          Alat kembali dengan aman tanpa kerusakan & keterlambatan
                        </p>
                      </div>
                    ) : !model.sett_payment_id ? (
                      // Case 2: Settlement required but not yet set
                      <>
                        <NumberInput
                          hideStepper
                          label="Biaya"
                          value={settlementAmount}
                          onValueChange={(e) => {
                            setSettlementAmount(e);
                          }}
                          startContent={
                            <div className="pointer-events-none flex gap-1 items-center text-primary">
                              <FaMoneyBillWave />
                              <span className="text-small">Rp</span>
                            </div>
                          }
                        />
                        <div className="flex flex-col gap-1">
                          <p className="text-small text-primary">Alasan</p>
                          <TextEditor
                            height={300}
                            readonly={false}
                            value={model.settlement_reason ?? ""}
                            onValueChange={(e) => {
                              setModelTransaction({ settlement_reason: e });
                            }}
                          />
                        </div>
                        {getStatusIndex(model.status) >= 5 &&
                          getStatusIndex(model.status) <= 6 && (
                            <div className="flex justify-end gap-2">
                              <Button
                                color="primary"
                                onPress={async () => {
                                  try {
                                    // Create payment
                                    console.log("Creating payment...");
                                    const payment: any = await new Promise(
                                      (resolve, reject) => {
                                        setModelPayment({
                                          nominal: settlementAmount,
                                        });
                                        const data = createPayment(true); // silent mode
                                        if (data) {
                                          resolve(data);
                                        } else {
                                          reject(
                                            new Error("Failed to create payment")
                                          );
                                        }
                                      }
                                    );
                                    console.log("Payment created:", payment);

                                    // Create penalty record
                                    const penaltyResult = await createPenalty({
                                      transaction_id: model.id,
                                      details: model.settlement_reason || "",
                                      price: settlementAmount,
                                    });

                                    // Update transaction
                                    const payload = {
                                      id: model.id,
                                      sett_payment_id: payment.id
                                    };
                                    setModelTransaction(payload);
                                    await createTransaction(payload);

                                    displayToast({ type: 'success', title: 'Success', description: 'Berhasil Mengirimkan Settlement!' });
                                  } catch (error) {
                                    displayToast({ type: 'danger', title: 'Error', description: 'Gagal menyimpan settlement!' });
                                  }
                                }}
                              >
                                Submit
                              </Button>
                            </div>
                          )}
                      </>
                    ) : (
                      // Case 3: Settlement already set
                      <div className="flex flex-col gap-2">
                        {(model.penalty?.details) && (
                          <div className="flex flex-col gap-1">
                            <p className="font-medium text-xs">
                              Alasan Settlement
                            </p>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: model.penalty?.details,
                              }}
                            />
                          </div>
                        )}
                        {(model.penalty?.price > 0 || settlementAmount > 0) && (
                          <div className="flex flex-col gap-1">
                            <p className="font-medium text-xs">
                              Biaya Settlement
                            </p>
                            <p className="text-sm">
                              Rp{" "}
                              {Number(
                                model.penalty?.price || settlementAmount
                              ).toLocaleString("id-ID")}
                            </p>
                          </div>
                        )}

                        {/* Payment Details for Admin */}
                        {model.sett_payment && (
                          <div className="mt-4 border-t border-dashed border-default-300 pt-4 flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <p className="font-semibold text-sm">Status Pembayaran</p>
                                <Chip
                                  size="sm"
                                  color={model.sett_payment?.status === 'paid' ? "success" : "warning"}
                                  variant="flat"
                                >
                                  {model.sett_payment?.status === 'paid' ? "Lunas" : "Belum Lunas"}
                                </Chip>
                              </div>
                              {model.sett_payment?.payment_method && (
                                <div className="flex justify-between items-center text-xs text-default-500">
                                  <p>Metode: {model.sett_payment.payment_method}</p>
                                </div>
                              )}
                            </div>

                            {model.sett_payment?.status === 'paid' && (
                              <div className="p-3 bg-success-50 rounded-lg flex items-center gap-2 text-success-700 text-sm">
                                <FaCheck className="text-success" />
                                <p className="font-medium">Pembayaran Settlement Telah Diterima</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </Section>
            )}

            <Section className="px-4 py-3 flex flex-col gap-2 w-full h-fit">
              <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                <FaCalendar className="text-primary" />
                <p>Rincian Pembayaran</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col text-default-800">
                  {getSubtotalCostume() > 0 && (
                    <div className="flex flex-row justify-between text-sm md:text-medium">
                      <p>Subtotal Alat</p>
                      <p>Rp {getSubtotalCostume().toLocaleString("id-ID")}</p>
                    </div>
                  )}

                  {getSubtotalAdditionalDay() > 0 && (
                    <div className="flex flex-row justify-between text-sm md:text-medium">
                      <p>Tambahan Hari Alat</p>
                      <p>
                        Rp {getSubtotalAdditionalDay().toLocaleString("id-ID")}
                      </p>
                    </div>
                  )}

                  {getSubtotalAddons() > 0 && (
                    <div className="flex flex-row justify-between text-sm md:text-medium">
                      <p>Subtotal Tambahan</p>
                      <p>Rp {getSubtotalAddons().toLocaleString("id-ID")}</p>
                    </div>
                  )}

                  {getSubtotalAccessories() > 0 && (
                    <div className="flex flex-row justify-between text-sm md:text-medium">
                      <p>Subtotal Aksesoris</p>
                      <p>Rp {getSubtotalAccessories().toLocaleString("id-ID")}</p>
                    </div>
                  )}

                  {getSubtotalAccessoriesAdditionalDay() > 0 && (
                    <div className="flex flex-row justify-between text-sm md:text-medium">
                      <p>Tambahan Hari Aksesoris</p>
                      <p>Rp {getSubtotalAccessoriesAdditionalDay().toLocaleString("id-ID")}</p>
                    </div>
                  )}

                  <div className="flex flex-row justify-between text-sm md:text-medium">
                    <p>Subtotal Pengiriman</p>
                    {model.s_shipping ? (
                      <p>Rp {getSubtotalShipping().toLocaleString("id-ID")}</p>
                    ) : type === "admin" && model?.status === "pending" ? (
                      <NumberInput
                        placeholder="Biaya Pengiriman"
                        hideStepper
                        value={sTempShipping.price}
                        onChange={(e) =>
                          setSTempShipping({
                            ...sTempShipping,
                            price: Number(e) || 0,
                          })
                        }
                        className="w-fit"
                      />
                    ) : (
                      <p>Tunggu Konfirmasi Admin</p>
                    )}
                  </div>

                  {getSubtotalDiscount() > 0 && (
                    <div className="flex flex-row justify-between text-sm md:text-medium">
                      <p>Voucher Diskon Digunakan</p>
                      <p>Rp -{getSubtotalDiscount().toLocaleString("id-ID")}</p>
                    </div>
                  )}

                  {getTotal() > 0 && (
                    <div className="flex justify-between text-medium md:text-lg text-foreground">
                      <p>Total</p>
                      <p className="font-semibold text-primary">
                        Rp {getTotal().toLocaleString("id-ID")}
                      </p>
                    </div>
                  )}

                  {/* Breakdown Deposit, DP, Sisa Pembayaran di bawah total */}
                  {(model.deposit?.nominal > 0 ||
                    model.dp_payment?.nominal > 0) && (
                      <>
                        <Divider className="my-2 bg-default" />
                        {model.deposit?.nominal > 0 && (
                          <div className="flex flex-row justify-between text-sm md:text-medium">
                            <p>Deposit</p>
                            <p className="font-medium">
                              Rp {model.deposit?.nominal?.toLocaleString("id-ID")}
                            </p>
                          </div>
                        )}


                      </>
                    )}
                </div>

                {model.dp_payment?.nominal > 0 && (
                  <div className="flex flex-col text-sm">
                    <div className="flex flex-row justify-between">
                      <p>Down Payment</p>
                      <p className="font-medium">
                        Rp {model.dp_payment?.nominal?.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between">
                      <p>
                        {getStatusIndex(model.status) === 2
                          ? "Kekurangan Pembayaran"
                          : "Pelunasan Pembayaran"}
                      </p>
                      <p className="font-medium">
                        Rp{" "}
                        {(
                          getTotal() - Number(model.dp_payment?.nominal ?? 0)
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </div>

          <div>
            {type === "user" && (
              <>
                {model?.status === "pending" && (
                  <Section className="px-4 py-3 flex flex-col gap-2">
                    <div className="flex gap-2 justify-end">
                      <Button color="danger" size="md" onPress={onOpenCancel}>
                        Cancel
                      </Button>
                      <Modal
                        isOpen={isOpenCancel}
                        placement="top-center"
                        onOpenChange={onOpenChangeCancel}
                      >
                        <ModalContent>
                          {(onClose) => (
                            <>
                              <ModalHeader className="flex flex-col gap-1">
                                Cancel
                              </ModalHeader>
                              <ModalBody>
                                <Textarea
                                  label="Alasan Pembatalan"
                                  variant="bordered"
                                  onValueChange={(e) => setCancelReason(e)}
                                />
                              </ModalBody>
                              <ModalFooter>
                                <Button
                                  color="danger"
                                  onPress={async () => {
                                    if (listAddon && listAddon.length > 0) {
                                      await restoreAddOnStock(
                                        listAddon.map((item: any) => ({
                                          id: item.add_on?.id || item.add_on,
                                          quantity: item.qty || 0,
                                        }))
                                      );
                                    }
                                    setModelTransaction({
                                      id: model.id,
                                      status: "cancel",
                                      cancel_reason: cancelReason,
                                    });
                                    createTransaction();
                                    displayToast({ type: 'success', title: 'Success', description: 'Berhasil Membatalkan Pesanan!' });
                                    sendNotification({
                                      data: {
                                        status: "cancel",
                                        payload: model,
                                      },
                                    });
                                    onClose();
                                  }}
                                >
                                  Cancel
                                </Button>
                              </ModalFooter>
                            </>
                          )}
                        </ModalContent>
                      </Modal>
                    </div>
                  </Section>
                )}
                {model?.status === "priority" && (
                  <Button
                    onPress={async () => {
                      await handleSubmitPriorityOrder({
                        model,
                        modelAddress,
                        addonsSelected,
                        setModelTransaction,
                        createTransaction,
                        createAddon,
                        getTotal,
                        getById,
                        getByTransactionId,
                        listAddon,
                      });
                    }}
                  >
                    Submit Order
                  </Button>
                )}

                {/* Payment Section for Waiting Status */}
                {model?.status === "waiting" && (
                  <Section className="px-4 py-3 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                      <FaMoneyBillWave className="text-primary" />
                      <p>Pembayaran</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-default-600">
                        Pilih metode pembayaran:
                      </p>

                      <RadioGroup
                        value={paymentType}
                        onValueChange={setPaymentType}
                        orientation="horizontal"
                      >
                        <Radio value="full" description={`Rp ${(model?.final_price - (Number(model?.deposit?.nominal ?? 0))).toLocaleString("id-ID")}`}>
                          Bayar Lunas
                        </Radio>
                        <Radio value="dp" description={`Rp ${Math.round((model?.final_price - (Number(model?.deposit?.nominal ?? 0))) * 0.5).toLocaleString("id-ID")} (50%)`}>
                          Bayar DP
                        </Radio>
                      </RadioGroup>

                      <div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Total Tagihan:</span>
                          <span className="font-semibold">
                            Rp {(model?.final_price - (Number(model?.deposit?.nominal ?? 0))).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <Divider />
                        <div className="flex justify-between text-sm">
                          <span>Yang akan dibayar:</span>
                          <span className="font-bold text-primary">
                            Rp {paymentType === "full"
                              ? (model?.final_price - (Number(model?.deposit?.nominal ?? 0))).toLocaleString("id-ID")
                              : Math.round((model?.final_price - (Number(model?.deposit?.nominal ?? 0))) * 0.5).toLocaleString("id-ID")
                            }
                          </span>
                        </div>
                        {paymentType === "dp" && (
                          <div className="flex justify-between text-sm text-warning">
                            <span>Sisa setelah DP:</span>
                            <span className="font-medium">
                              Rp {Math.round((model?.final_price - (Number(model?.deposit?.nominal ?? 0))) * 0.5).toLocaleString("id-ID")}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        color="primary"
                        size="lg"
                        className="w-full"
                        onPress={handleSubmitPayment}
                      >
                        {paymentType === "full" ? "Bayar Lunas" : "Bayar DP"} dengan Midtrans
                      </Button>
                    </div>
                  </Section>
                )}

                {/* Payment Section for DP Status - Pay Remaining */}
                {model?.status === "dp" && !model?.payment && (
                  <Section className="px-4 py-3 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                      <FaMoneyBillWave className="text-primary" />
                      <p>Pelunasan Pembayaran</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Alert color="warning">
                        Anda sudah membayar DP sebesar Rp {model?.dp_payment?.nominal?.toLocaleString("id-ID")}.
                        Silakan lunasi sisa pembayaran.
                      </Alert>

                      <div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Total Tagihan:</span>
                          <span>Rp {model?.final_price?.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>DP Terbayar:</span>
                          <span className="text-success">- Rp {model?.dp_payment?.nominal?.toLocaleString("id-ID")}</span>
                        </div>
                        {model?.deposit?.nominal > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Deposit:</span>
                            <span className="text-success">- Rp {model?.deposit?.nominal?.toLocaleString("id-ID")}</span>
                          </div>
                        )}
                        <Divider />
                        <div className="flex justify-between text-sm">
                          <span>Sisa yang harus dibayar:</span>
                          <span className="font-bold text-primary">
                            Rp {(model?.final_price - (Number(model?.deposit?.nominal ?? 0) + Number(model?.dp_payment?.nominal ?? 0))).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      <Button
                        color="primary"
                        size="lg"
                        className="w-full"
                        onPress={() => handleSubmitPayment()}
                      >
                        Lunasi Pembayaran dengan Midtrans
                      </Button>
                    </div>
                  </Section>
                )}

                {/* Settlement Payment Section */}
                {model.sett_payment_id && model.sett_payment?.status !== 'paid' && (
                  <Section className="px-4 py-3 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
                      <FaMoneyBillWave className="text-primary" />
                      <p>Pembayaran Settlement</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm">
                        <span>Status Pembayaran:</span>
                        <Chip
                          size="sm"
                          color={model.sett_payment?.status === 'paid' ? "success" : "warning"}
                          variant="flat"
                        >
                          {model.sett_payment?.status === 'paid' ? "Lunas" : "Belum Lunas"}
                        </Chip>
                      </div>

                      {model.sett_payment?.payment_method && (
                        <div className="flex justify-between items-center text-xs text-default-500">
                          <span>Metode Pembayaran:</span>
                          <span>{model.sett_payment.payment_method}</span>
                        </div>
                      )}

                      {model.sett_payment?.status !== 'paid' && (
                        <>
                          <Alert color="primary">
                            Silakan lakukan pembayaran biaya settlement sebesar <span className="font-bold">Rp {(Number(model.penalty?.price) || Number(model.sett_payment?.nominal) || 0).toLocaleString('id-ID')}</span>
                          </Alert>
                          <Button
                            color="primary"
                            size="lg"
                            className="w-full mt-2"
                            onPress={() => handleSubmitPayment("settlement")}
                          >
                            Bayar Settlement dengan Midtrans
                          </Button>
                        </>
                      )}

                      {model.sett_payment?.status === 'paid' && (
                        <div className="p-3 bg-success-50 rounded-lg flex items-center gap-2 text-success-700 text-sm">
                          <FaCheck className="text-success" />
                          <p className="font-medium">Pembayaran Settlement Telah Diterima</p>
                        </div>
                      )}
                    </div>
                  </Section>
                )}
              </>
            )}
          </div>

          <div>
            {type === "admin" && (
              <>
                {model.status === "pending" && (
                  <Section className="px-4 py-3 flex flex-col gap-2">
                    <div className="flex gap-2 justify-end">
                      <Button color="danger" size="md" onPress={onOpenReject}>
                        Tolak
                      </Button>
                      <Modal
                        isOpen={isOpenReject}
                        placement="top-center"
                        onOpenChange={onOpenChangeReject}
                      >
                        <ModalContent>
                          {(onClose) => (
                            <>
                              <ModalHeader className="flex flex-col gap-1">
                                Tolak
                              </ModalHeader>
                              <ModalBody>
                                <Textarea
                                  label="Alasan Penolakan"
                                  variant="bordered"
                                  onValueChange={(e) => setRejectReason(e)}
                                />
                              </ModalBody>
                              <ModalFooter>
                                <Button
                                  color="danger"
                                  onPress={async () => {
                                    if (listAddon && listAddon.length > 0) {
                                      await restoreAddOnStock(
                                        listAddon.map((item: any) => ({
                                          id: item.add_on?.id || item.add_on,
                                          quantity: item.qty || 0,
                                        }))
                                      );
                                    }
                                    setModelTransaction({
                                      id: model.id,
                                      status: "reject",
                                      reject_reason: rejectReason,
                                    });
                                    createTransaction();
                                    displayToast({ type: 'success', title: 'Success', description: 'Berhasil Menolak Pesanan!' });
                                    sendNotification({
                                      data: {
                                        status: "reject",
                                        payload: {
                                          ...model,
                                          reject_reason: rejectReason,
                                        },
                                      },
                                    });
                                    onClose();
                                  }}
                                >
                                  Tolak
                                </Button>
                              </ModalFooter>
                            </>
                          )}
                        </ModalContent>
                      </Modal>
                      <Button
                        color="primary"
                        size="md"
                        onPress={() => {
                          handleAcceptOrder();
                        }}
                      >
                        Terima
                      </Button>
                    </div>
                  </Section>
                )}

                {getStatusIndex(model.status) >= 5 &&
                  getStatusIndex(model.status) <= 6 && (
                    <div className="flex justify-end flex-col md:flex-row gap-2 w-full md:w-auto py-2">
                      {getStatusIndex(model.status) === 5 && (
                        <Button
                          color="danger"
                          fullWidth
                          onPress={() => {
                            const newModel = { ...model, status: "settlement" };
                            setModelTransaction(newModel);
                            createTransaction({
                              id: model.id,
                              status: "settlement"
                            });
                            displayToast({ type: 'success', title: 'Success', description: 'Transaksi Bermasalah!' });
                            sendNotification({
                              data: {
                                status: "settlement",
                                payload: newModel,
                              },
                            });
                          }}
                        >
                          Bermasalah
                        </Button>
                      )}
                      <Button
                        color="primary"
                        fullWidth
                        onPress={() => {
                          const newModel = { ...model, status: "done" };
                          setModelTransaction(newModel);
                          createTransaction({
                            id: model.id,
                            status: "done"
                          });
                          displayToast({ type: 'success', title: 'Success', description: 'Berhasil Menyelesaikan Transaksi!' });
                          sendNotification({
                            data: {
                              status: "done",
                              payload: newModel,
                            },
                          });
                        }}
                      >
                        Selesaikan
                      </Button>
                    </div>
                  )}
              </>
            )}
          </div>
        </>
      )}
    </div >
  );
};

export default Transaction;
