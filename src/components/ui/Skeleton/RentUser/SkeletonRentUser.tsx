import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/heroui";

const SkeletonRentUser = ({ type }: { type: "rent" | "order" }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Stepper */}
      {type === "order" && (
        <Section className="flex flex-col gap-2 px-3 py-2">
          <Skeleton className="h-12 w-full" />
        </Section>
      )}

      {/* Data diri */}
      <Section className="flex flex-col gap-2 px-3 py-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/2" />
      </Section>

      {/* Expedition */}
      {type === "order" && (
        <div className="grid grid-cols-2 gap-2">
          {/* Pengiriman */}
          <Section className="flex flex-col gap-2 px-3 py-2">
            <Skeleton className="h-6 w-1/4" />
            <div className="flex flex-row gap-2 justify-between">
              <Skeleton className="h-6 w-[40%]" />
              <Skeleton className="h-6 w-[60%]" />
            </div>
            <div className="flex flex-row gap-2 justify-end">
              <Skeleton className="h-6 w-[30%]" />
            </div>
          </Section>

          {/* Pengembalian */}
          <Section className="flex flex-col gap-2 px-3 py-2">
            <Skeleton className="h-6 w-1/4" />
            <div className="flex flex-row gap-2 justify-between">
              <Skeleton className="h-6 w-[40%]" />
              <Skeleton className="h-6 w-[60%]" />
            </div>
            <div className="flex flex-row gap-2 justify-end">
              <Skeleton className="h-6 w-[30%]" />
            </div>
          </Section>
        </div>
      )}

      {/* Tabel Data Sewa */}
      <Section className="flex flex-row items-start gap-2 px-3 py-2">
        <Skeleton className="h-[150px] w-[150px]" />
        <div className="flex flex-col justify-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-32 mt-6" />
        </div>
      </Section>

      {/* Kalender */}
      <Section className="flex flex-col md:flex-row gap-2 px-3 py-2">
        <Skeleton className="h-[350px] w-full md:w-[30%]" />
        <Skeleton className="h-[350px] w-full md:w-[70%]" />
      </Section>

      {/* Voucher */}
      <Section className="flex flex-col gap-2 px-3 py-2">
        <Skeleton className="h-6 w-1/4" />
        <div className="flex flex-row gap-2">
          <Skeleton className="h-6 w-[80%]" />
          <Skeleton className="h-6 w-[20%]" />
        </div>
      </Section>

      {/* Rincian Pembayaran */}
      <Section className="flex flex-col gap-2 px-3 py-2">
        <Skeleton className="h-6 w-1/4" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-row justify-between gap-2">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
          </div>
        ))}
      </Section>

      {/* Button */}
      <Section className="flex flex-col gap-2 px-3 py-2">
        <div className="flex flex-row gap-2 justify-end">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-8 w-1/4" />
        </div>
      </Section>

      {/* Bukti Pembayaran */}

      {type === "order" && (
        <Section className="flex flex-col gap-2 px-3 py-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-[200px] w-full" />
        </Section>
      )}
    </div>
  );
};

export default SkeletonRentUser;
