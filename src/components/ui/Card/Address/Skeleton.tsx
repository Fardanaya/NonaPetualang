import { Skeleton } from "../../heroui";

const SkeletonAddressCard = () => {
  return (
    <div className="border-primary space-y-4 border rounded-lg p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-1/3" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonAddressCard;
