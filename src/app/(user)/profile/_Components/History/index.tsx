import { Section } from "@/components/ui/Section";
import React, { useEffect, useState } from "react";
import { FaHistory } from "react-icons/fa";
import UserOrderCard from "@/components/ui/Card/Order/UserOrderCard";
import { useUserTransactions } from "@/hooks/react-query/transaction";
import { useSession } from "@/components/providers/SessionProvider";
import { useRouter } from "next/navigation";
import SkeletonOrderCard from "@/components/ui/Card/Order/Skeleton";

const HistoryPage = () => {
  const { user: sessionUser } = useSession();
  const { data: list = [], isLoading: loading } = useUserTransactions(sessionUser?.id || '');
  const router = useRouter();
  const [loadPage, setLoadPage] = useState(true);

  useEffect(() => {
    setLoadPage(false);
  }, []);

  const doneOrders = list.filter((order) => order.status === "done").slice().reverse();

  return (
    <Section className="px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <FaHistory className="text-primary" size={20} />
        <h2 className="text-xl font-semibold">History</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {loading || loadPage
            ? Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonOrderCard key={idx} />
              ))
            : doneOrders.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-4">
                    <FaHistory className="text-default-300" size={28} />
                  </div>
                  <p className="text-default-600 font-medium mb-1">Belum ada history</p>
                  <p className="text-sm text-default-400">
                    Order yang sudah selesai akan muncul di sini
                  </p>
                </div>
              )
            : doneOrders.map((order, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(`/order/${order.id}`)}
                  className="cursor-pointer"
                >
                  <UserOrderCard item={order} />
                </div>
              ))}
        </div>
      </Section>
  );
};

export default HistoryPage;

