import { Avatar, Divider } from "@heroui/react";
import { FaCalendarDays, FaHashtag } from "react-icons/fa6";
import { Section } from "@/components/ui/Section";
import { useCallback, useEffect, useState, useMemo } from "react";
import { fetchInstagram } from "@/lib/fetch";
import Image from "next/image";
import { Chip } from "../../heroui";
import { LuMapPin } from "react-icons/lu";
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

const AdminOrderCard = ({ item }: { item: any }) => {
  const [instagramData, setInstagramData] = useState<any>();

  const fetchInstagramData = useCallback(async (username: string) => {
    const data = await fetchInstagram(username);
    setInstagramData(data);
  }, []);

  useEffect(() => {
    if (item?.user?.instagram) fetchInstagramData(item?.user?.instagram);
  }, [item?.user?.instagram, fetchInstagramData]);

  const statusInfo = useMemo(() => getStatusInfo(item?.status), [item?.status]);
  const rentalDays = useMemo(() => calculateRentalDays(item?.start_rent, item?.end_rent), [item?.start_rent, item?.end_rent]);

  // Get quantity from transaction_items
  const quantity = useMemo(() => {
    const catalogItem = item?.transaction_items?.find((i: any) => i.item_type === 'catalog');
    return catalogItem?.quantity || 1;
  }, [item?.transaction_items]);

  const shortOrderId = item?.id?.slice(0, 8)?.toUpperCase() || "-";

  return (
    <Section className="flex flex-col gap-2 px-3 py-2.5 hover:shadow-md transition-all duration-200 hover:border-primary/30">
      {/* Header: Order ID + Status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs text-default-500">
          <FaHashtag size={10} />
          <span className="font-mono">{shortOrderId}</span>
        </div>
        <Chip 
          variant="flat" 
          radius="full" 
          size="sm"
          style={{ 
            backgroundColor: `${statusInfo.color}30`,
            color: statusInfo.color,
          }}
          className="font-medium text-xs"
        >
          {statusInfo.label}
        </Chip>
      </div>

      {/* Product Info */}
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="relative w-14 h-14 aspect-square flex-shrink-0">
          <Image
            src={item?.catalog?.images?.[0] || "/placeholder.jpeg"}
            alt={item?.catalog?.name || "-"}
            fill={true}
            className="object-cover rounded-lg"
          />
          {quantity > 1 && (
            <div className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {quantity}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 min-w-0 gap-1">
          <h3 className="text-sm font-semibold text-primary line-clamp-1">
            {item?.catalog?.name || "-"}
          </h3>
          
          {/* User */}
          <div className="flex items-center gap-1.5">
            <Avatar
              src={item?.user?.image || "/anya.png"}
              className="w-4 h-4"
            />
            <span className="text-xs text-default-600 truncate">
              {instagramData?.username || item?.user?.name || "-"}
            </span>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-1 text-[11px] text-default-500">
            <FaCalendarDays size={10} />
            <span>
              {item?.start_rent
                ? new Date(item.start_rent).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })
                : "-"}{" "}
              -{" "}
              {item?.end_rent
                ? new Date(item.end_rent).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })
                : "-"}
              <span className="text-default-400 ml-1">({rentalDays}d)</span>
            </span>
          </div>
        </div>
      </div>

      <Divider className="my-0.5" />

      {/* Footer: Address + Price */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-1 text-default-500 min-w-0 flex-1">
          <LuMapPin className="flex-shrink-0" size={11} />
          <span className="text-[11px] truncate">
            {item?.address?.city || item?.address?.district || "-"}
          </span>
        </div>
        <p className="text-sm font-bold text-green-600 flex-shrink-0">
          Rp {(item?.total_price / 1000).toFixed(0)}K
        </p>
      </div>
    </Section>
  );
};

export default AdminOrderCard;
