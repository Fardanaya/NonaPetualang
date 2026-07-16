"use client";

import TableTitle from "@/components/ui/Table/Title";
import { Input } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import { useEffect, useState, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTransactions, transactionStatus } from "@/hooks/react-query/transaction";
import SkeletonOrderCard from "@/components/ui/Card/Order/Skeleton";
import OrderCard from "@/components/ui/Card/Order/AdminOrderCard";
import { ScrollShadow, Chip } from "@heroui/react";
import { FaListUl, FaTableColumns } from "react-icons/fa6";
import { Button } from "@/components/ui/heroui";

// Kanban column statuses - ordered by workflow
const kanbanStatuses = [
  { value: "pending", label: "Pending", color: "#FFB347" },
  { value: "waiting", label: "Waiting", color: "#FFD3B6" },
  { value: "dp", label: "DP", color: "#FFEEAD" },
  { value: "paid", label: "Paid", color: "#B5EAD7" },
  { value: "sending", label: "Sending", color: "#A2C8FF" },
  { value: "returning", label: "Returning", color: "#A2C8FF" },
  { value: "settlement", label: "Settlement", color: "#D8B5FF" },
  { value: "done", label: "Done", color: "#DCEDC1" },
];

// Kanban Column Component
const KanbanColumn = ({ 
  status, 
  orders, 
  loading, 
  onOrderClick 
}: { 
  status: typeof kanbanStatuses[0]; 
  orders: any[]; 
  loading: boolean;
  onOrderClick: (id: string) => void;
}) => {
  return (
    <div className="flex flex-col min-w-[320px] max-w-[320px] bg-default-50 rounded-xl border border-default-200">
      {/* Column Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b border-default-200 rounded-t-xl"
        style={{ backgroundColor: `${status.color}30` }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: status.color }}
          />
          <span className="font-semibold text-sm">{status.label}</span>
        </div>
        <Chip size="sm" variant="flat" className="bg-white/50">
          {orders.length}
        </Chip>
      </div>

      {/* Column Content */}
      <ScrollShadow className="flex flex-col gap-2 p-2 max-h-[calc(100vh-16.5rem)] overflow-y-auto">
        {loading ? (
          <>
            <SkeletonOrderCard />
            <SkeletonOrderCard />
          </>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-default-400 text-sm">
            Tidak ada order
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => onOrderClick(order.id)}
              className="cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <OrderCard item={order} />
            </div>
          ))
        )}
      </ScrollShadow>
    </div>
  );
};

const OrderPage = () => {
  const router = useRouter();
  const [loadPage, setLoadPage] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const { isLoading: loading, data: list = [] } = useTransactions();

  // Filter orders by search term
  const filteredOrders = useMemo(() => {
    if (!search) return list;
    return list.filter((item: any) =>
      item.catalog?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.id?.toLowerCase().includes(search.toLowerCase())
    );
  }, [list, search]);

  // Group orders by status
  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    kanbanStatuses.forEach((status) => {
      grouped[status.value] = filteredOrders.filter(
        (order: any) => order.status?.toLowerCase() === status.value
      );
    });
    return grouped;
  }, [filteredOrders]);

  // Total active orders (excluding done)
  const totalActiveOrders = useMemo(() => {
    return filteredOrders.filter(
      (order: any) => order.status?.toLowerCase() !== "done"
    ).length;
  }, [filteredOrders]);

  useEffect(() => {
    setLoadPage(false);
  }, [list]);

  const handleOrderClick = (id: string) => {
    router.push(`/admin/order/${id}`);
  };

  return (
    <Section className="px-4 py-3 space-y-4 w-full max-w-full overflow-hidden flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div className="flex items-center gap-4">
          <TableTitle title="Order Management" description="Kanban Board" />
          <Chip variant="flat" color="primary" size="sm">
            {totalActiveOrders} Active
          </Chip>
        </div>
        
        <div className="flex flex-row items-center gap-2">
          {/* View Toggle */}
          <div className="flex border border-default-200 rounded-lg overflow-hidden">
            <Button
              size="sm"
              variant={viewMode === "kanban" ? "solid" : "light"}
              color={viewMode === "kanban" ? "primary" : "default"}
              className="rounded-none"
              onPress={() => setViewMode("kanban")}
            >
              <FaTableColumns size={14} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "solid" : "light"}
              color={viewMode === "list" ? "primary" : "default"}
              className="rounded-none"
              onPress={() => setViewMode("list")}
            >
              <FaListUl size={14} />
            </Button>
          </div>

          <Input
            type="text"
            placeholder="Search order..."
            startContent={<FaSearch className="text-primary" />}
            value={search}
            onValueChange={setSearch}
            className="w-64"
          />
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <ScrollShadow orientation="horizontal" className="flex-1 overflow-y-hidden">
          <div className="flex gap-4 min-w-max">
            {kanbanStatuses.map((status) => (
              <KanbanColumn
                key={status.value}
                status={status}
                orders={ordersByStatus[status.value] || []}
                loading={loading || loadPage}
                onOrderClick={handleOrderClick}
              />
            ))}
          </div>
        </ScrollShadow>
      )}

      {/* List View (fallback) */}
      {viewMode === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading || loadPage
            ? Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonOrderCard key={idx} />
              ))
            : filteredOrders.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => handleOrderClick(item.id)}
                  className="cursor-pointer"
                >
                  <OrderCard item={item} />
                </div>
              ))}
        </div>
      )}
    </Section>
  );
};

export default OrderPage;
