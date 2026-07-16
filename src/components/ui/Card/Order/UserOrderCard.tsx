import { FaClock, FaBox, FaCalendarDays, FaHashtag } from "react-icons/fa6";
import { Section } from "@/components/ui/Section";
import { useMemo } from "react";
import Image from "next/image";
import { Button, Chip } from "../../heroui";
import { Divider, Progress } from "@heroui/react";
import { useRouter } from "next/navigation";
import { transactionStatus, extendedTransactionStatus } from "@/hooks/react-query/transaction";

// Helper function to get status info
const getStatusInfo = (status: string) => {
  const allStatuses = [...extendedTransactionStatus];
  return allStatuses.find(s => s.value === status?.toLowerCase()) || {
    value: status,
    label: status,
    color: "#9CA3AF",
    description: ""
  };
};

// Helper function to calculate rental days
const calculateRentalDays = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Helper function to get status progress
const getStatusProgress = (status: string) => {
  const statusOrder = ["pending", "waiting", "dp", "paid", "sending", "returning", "settlement", "done"];
  const index = statusOrder.indexOf(status?.toLowerCase());
  if (index === -1) return 0;
  return ((index + 1) / statusOrder.length) * 100;
};

// Helper function to get status step description
const getStatusStepDescription = (status: string) => {
  const descriptions: Record<string, string> = {
    pending: "Menunggu konfirmasi admin",
    waiting: "Menunggu pembayaran",
    dp: "DP diterima, lanjutkan pelunasan",
    paid: "Pembayaran diterima",
    sending: "Pesanan sedang dikirim",
    returning: "Pesanan sedang dikembalikan",
    settlement: "Menunggu penyelesaian",
    done: "Pesanan selesai",
    cancel: "Pesanan dibatalkan",
    reject: "Pesanan ditolak"
  };
  return descriptions[status?.toLowerCase()] || "";
};

const UserOrderCard = ({ item }: { item: any }) => {
  const router = useRouter();

  const statusInfo = useMemo(() => getStatusInfo(item?.status), [item?.status]);
  const rentalDays = useMemo(() => calculateRentalDays(item?.start_rent, item?.end_rent), [item?.start_rent, item?.end_rent]);
  const statusProgress = useMemo(() => getStatusProgress(item?.status), [item?.status]);
  const statusDescription = useMemo(() => getStatusStepDescription(item?.status), [item?.status]);

  // Get quantity from transaction_items
  const quantity = useMemo(() => {
    const catalogItem = item?.transaction_items?.find((i: any) => i.item_type === 'catalog');
    return catalogItem?.quantity || 1;
  }, [item?.transaction_items]);

  const shortOrderId = item?.id?.slice(0, 8)?.toUpperCase() || "-";
  const isDone = item?.status?.toLowerCase() === "done";
  const isCanceled = ["cancel", "reject"].includes(item?.status?.toLowerCase());

  return (
    <Section className="flex flex-col gap-3 px-4 py-3 hover:shadow-md transition-shadow duration-200">
      {/* Header: Image + Main Info */}
      <div className="flex flex-row gap-4 items-start">
        {/* Product Image */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 aspect-square flex-shrink-0">
          <Image
            src={item?.catalog?.images?.[0] || "/placeholder.jpeg"}
            alt={item?.catalog?.name || "-"}
            fill={true}
            className="object-cover rounded-lg"
          />
          {/* Quantity Badge */}
          {quantity > 1 && (
            <div className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {quantity}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-col w-full gap-2 min-w-0">
          {/* Title + Status */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <h3 className="text-base md:text-lg font-bold text-primary hover:text-primary-600 line-clamp-1">
                {item?.catalog?.name || "-"}
              </h3>
              <div className="flex items-center gap-2 text-xs text-default-500">
                <FaHashtag size={10} />
                <span className="font-mono">{shortOrderId}</span>
                <span className="text-default-300">•</span>
                <span>{rentalDays} hari</span>
              </div>
            </div>
            <Chip 
              variant="flat" 
              radius="full" 
              size="sm"
              style={{ 
                backgroundColor: `${statusInfo.color}20`,
                color: statusInfo.color,
                borderColor: statusInfo.color
              }}
              className="font-medium border flex-shrink-0"
            >
              {statusInfo.label}
            </Chip>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 text-xs text-default-600">
            <FaCalendarDays size={12} />
            <span>
              {item?.start_rent
                ? new Date(item.start_rent).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}{" "}
              -{" "}
              {item?.end_rent
                ? new Date(item.end_rent).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </span>
          </div>

          {/* Price + Quantity */}
          <div className="flex items-center justify-between">
            <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Rp {item?.total_price?.toLocaleString("id-ID") || "0"}
            </p>
            {quantity > 1 && (
              <div className="flex items-center gap-1 text-xs text-default-500">
                <FaBox size={10} />
                <span>{quantity}x</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Progress Section */}
      {!isCanceled && (
        <>
          <Divider className="my-1" />
          
          <div className="flex flex-col gap-2">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <Progress
                size="sm"
                value={statusProgress}
                color={isDone ? "success" : "primary"}
                className="flex-1"
                aria-label="Order progress"
              />
              <span className="text-xs text-default-500 whitespace-nowrap">
                {Math.round(statusProgress)}%
              </span>
            </div>
            
            {/* Status Description */}
            <p className="text-xs text-default-500 italic">
              {statusDescription}
            </p>
          </div>
        </>
      )}

      {/* Canceled/Rejected Notice */}
      {isCanceled && (
        <>
          <Divider className="my-1" />
          <p className="text-xs text-danger italic text-center py-1">
            {item?.status?.toLowerCase() === "cancel" 
              ? "Pesanan ini telah dibatalkan" 
              : "Pesanan ini ditolak oleh admin"}
          </p>
        </>
      )}

      {/* Action Button */}
      {isDone && (
        <>
          <Divider className="my-1" />
          <div className="flex justify-end">
            <Button 
              color="primary" 
              size="sm"
              onPress={() => router.push(`/catalog/${item.catalog?.id}`)}
            >
              Pesan Lagi
            </Button>
          </div>
        </>
      )}
    </Section>
  );
};

export default UserOrderCard;
