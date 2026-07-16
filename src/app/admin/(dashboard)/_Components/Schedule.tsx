import { RentCalendar } from "@/components/ui/Calendar";
import { Section } from "@/components/ui/Section";
import { useTransactions } from "@/hooks/react-query/transaction";
import { useEffect, useMemo } from "react";
import { FaClock, FaTruck } from "react-icons/fa6";
import { LuSwords } from "react-icons/lu";

const Schedule = () => {
  const { isLoading: loading, data: list = [] } = useTransactions();

  // Calculate counts based on transaction status
  const counts = useMemo(() => {
    const pending = list.filter(item => item.status === 'pending').length;
    const paid = list.filter(item => item.status === 'paid').length;
    const sending = list.filter(item => item.status === 'sending').length;
    const done = list.filter(item => item.status === 'done').length;

    return { pending, paid, sending, done };
  }, [list]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-wrap grid-cols-2 md:grid-cols-4 gap-4">
        <Section className="px-4 py-3 flex flex-row items-center gap-2">
          <div className="p-4 bg-primary rounded-lg">
            <FaClock className="text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs md:text-sm font-medium text-default-800">
              Pending
            </p>
            <p className="text-2xl md:text-3xl font-semibold tracking-wide">
              {counts.pending}
            </p>
          </div>
        </Section>
        <Section className="px-4 py-3 flex flex-row items-center gap-2">
          <div className="p-4 bg-primary rounded-lg">
            <FaTruck className="text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs md:text-sm font-medium text-default-800">
              Paid
            </p>
            <p className="text-2xl md:text-3xl font-semibold tracking-wide">
              {counts.paid}
            </p>
          </div>
        </Section>
        <Section className="px-4 py-3 flex flex-row items-center gap-2">
          <div className="p-4 bg-primary rounded-lg">
            <LuSwords className="text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs md:text-sm font-medium text-default-800">
              In-Use
              {/* yang statusnya sending */}
            </p>
            <p className="text-2xl md:text-3xl font-semibold tracking-wide">
              {counts.sending}
            </p>
          </div>
        </Section>
        <Section className="px-4 py-3 flex flex-row items-center gap-2">
          <div className="p-4 bg-primary rounded-lg">
            <FaTruck className="text-white scale-x-[-1]" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs md:text-sm font-medium text-default-800">
              Maintenance
            </p>
            <p className="text-2xl md:text-3xl font-semibold tracking-wide">
              {counts.done}
            </p>
          </div>
        </Section>
      </div>
      <Section className="px-4 py-2">
        <RentCalendar listData={list} loading={loading} className="h-[80vh]" />
      </Section>
    </div>
  );
};

export default Schedule;
