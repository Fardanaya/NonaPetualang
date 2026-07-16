"use client";

import Transaction from "@/components/ui/Transaction";
import { Switch } from "@heroui/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useTransaction } from "@/hooks/react-query/transaction";

const Page = () => {
  const [viewType, setViewType] = useState<"admin" | "user">("user");
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const transactionId = params.id as string;

  // Fetch transaction data to check if order was created by admin
  const { data: transaction } = useTransaction(transactionId);

  // Check if the order was created by an admin
  const isOrderByAdmin = transaction?.user?.is_admin === true;

  // Set default view type based on whether order was created by admin
  useEffect(() => {
    if (isOrderByAdmin) {
      setViewType("admin");
    }
  }, [isOrderByAdmin]);

  // Clean URL and check payment status after Midtrans redirect
  useEffect(() => {
    const transactionStatus = searchParams.get("transaction_status");
    const statusCode = searchParams.get("status_code");
    const orderId = searchParams.get("order_id");

    // Immediately clean URL if Midtrans params are present
    if (transactionStatus || statusCode || orderId) {
      // Clean URL immediately to hide query params
      window.history.replaceState({}, '', `/order/${transactionId}`);

      setIsChecking(true);

      // Call the check-status API to verify and update payment
      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(`/api/midtrans/check-status?transaction_id=${transactionId}&order_id=${orderId || ""}`);
          const data = await response.json();
          console.log("Payment status check result:", data);
        } catch (error) {
          console.error("Error checking payment status:", error);
        } finally {
          setIsChecking(false);
        }
      };

      checkPaymentStatus();
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {isChecking && (
        <div className="flex justify-center p-4 bg-primary/10 rounded-lg">
          <p className="text-primary animate-pulse">Memeriksa status pembayaran...</p>
        </div>
      )}
      {/* Only show view toggle if order was created by admin */}
      {isOrderByAdmin && (
        <div className="flex justify-center p-4 bg-default-100 rounded-lg">
          <Switch
            isSelected={viewType === "admin"}
            onValueChange={(val) => setViewType(val ? "admin" : "user")}
          >
            View as Admin
          </Switch>
        </div>
      )}
      <Transaction type={viewType} />
    </div>
  );
};

export default Page;
