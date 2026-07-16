import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/heroui";

const SkeletonHome = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Banner */}
      <Section className="flex flex-col gap-4 px-3 py-2">
        <Skeleton className="h-[225px] w-full" />
      </Section>

      {/* Katalog Terlaris */}
      <Section className="flex flex-col gap-4 px-3 py-2 w-full">
        <Skeleton className="h-6 w-1/3" />
        <div className="flex flex-row justify-between gap-2 w-full">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/5" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-2 ${idx > 3 ? "hidden md:flex" : ""}`}
            >
              <Skeleton className="h-[225px] w-full" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </Section>

      {/* Katalog Produk */}
      <div className="flex flex-col justify-between md:flex-row gap-4 w-full">
        <Section className="flex flex-col gap-4 px-3 py-2 md:w-1/2">
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>

          <div className="flex flex-row gap-4 w-full">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-2 w-full ${idx > 1 ? "hidden md:flex" : ""}`}
              >
                <Skeleton className="h-[150px] w-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </Section>
        <Section className="flex flex-col gap-4 px-3 py-2 md:w-1/2">
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>

          <div className="flex flex-row gap-4 w-full">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-2 w-full ${idx > 1 ? "hidden md:flex" : ""}`}
              >
                <Skeleton className="h-[150px] w-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default SkeletonHome;
