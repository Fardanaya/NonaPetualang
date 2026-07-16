"use client";
import OrderCard from "@/components/ui/Card/Order/AdminOrderCard";
import UserOrderCard from "@/components/ui/Card/Order/UserOrderCard";
import { getStatusIndex, useUserTransactions } from "@/hooks/react-query/transaction";
import { baseStyles, Tab, Tabs } from "@heroui/react";
import { useSession } from "@/components/providers/SessionProvider";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const page = () => {
  const router = useRouter();
  const { user: sessionUser } = useSession();
  const state = [
    { id: "all", label: "All" },
    { id: "berlangsung", label: "Sedang Berlangsung" },
    { id: "done", label: "Done" },
  ];
  const { data: list = [], isLoading: loading } = useUserTransactions(sessionUser?.id || '');
  // useEffect removed as fetching is handled by hook

  return (
    <div className="flex w-full flex-col pt-3">
      <Tabs items={state} fullWidth>
        {(item) => (
          <Tab key={item.id} title={item.label}>
            <div className="flex flex-col gap-3">
              {list
                .filter((order) => {
                  if (item.id === "all") return true;
                  if (item.id === "done") return order.status === "done";
                  if (item.id === "berlangsung") return order.status !== "done";
                  return false;
                })
                .map((order, idx) => (
                  <div
                    key={idx}
                    onClick={() => router.push(`/order/${order.id}`)}
                    className="cursor-pointer"
                  >
                    <UserOrderCard item={order} />
                  </div>
                ))}
            </div>
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

export default page;
