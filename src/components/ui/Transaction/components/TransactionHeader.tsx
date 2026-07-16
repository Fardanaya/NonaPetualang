"use client";

import { Section } from "@/components/ui/Section";
import { Stepper } from "@/components/ui/Stepper";
import { getStatusIndex, transactionStatus, depositExtendedTransactionStatus } from "@/hooks/react-query/transaction";

interface TransactionHeaderProps {
    model: any;
}

export const TransactionHeader = ({ model }: TransactionHeaderProps) => {
    return (
        <Section className="py-4 relative overflow-x-auto md:overflow-hidden">
            {model?.cancel_reason || model?.reject_reason ? (
                <div className="flex items-center gap-4 px-4">
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
    );
};
