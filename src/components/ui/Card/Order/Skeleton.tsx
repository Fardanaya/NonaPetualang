import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/heroui";
import { Divider } from "@heroui/react";

const SkeletonOrderCard = () => {
  return (
    <Section className="flex flex-col gap-3 px-4 py-3">
      {/* Header: Image + Main Info */}
      <div className="flex flex-row gap-4 items-start">
        {/* Product Image */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 aspect-square flex-shrink-0">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>

        {/* Main Content */}
        <div className="flex flex-col w-full gap-2 min-w-0">
          {/* Title + Status */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton className="h-5 w-3/4 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-3 w-1/3 rounded" />
          </div>

          {/* Address */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </div>
        </div>
      </div>

      <Divider className="my-1" />

      {/* Footer: Date + Price */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3 h-3 rounded" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-28 rounded" />
          <Skeleton className="h-3 w-8 rounded" />
        </div>
      </div>

      {/* Progress Bar */}
      <Skeleton className="h-2 w-full rounded-full mt-1" />
    </Section>
  );
};

export default SkeletonOrderCard;
