import { Card, CardBody } from "@heroui/react";
import { Skeleton } from "../../heroui";

const SkeletonAccessoryCard = () => {
  return (
    <Card isPressable shadow="sm" radius="sm" className="w-full h-full">
      <CardBody className="overflow-hidden p-0">
        <div className="relative w-full">
          <Skeleton className="w-full h-full aspect-square" />
        </div>
        <div className="flex flex-col gap-3 justify-between items-start p-2 md:px-3">
          <Skeleton className="w-full h-4" />
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col gap-1">
              <Skeleton className="w-full h-3" />
              <Skeleton className="w-full h-3" />
            </div>
            <div className="flex flex-wrap gap-1 capitalize">
              <Skeleton className="w-12 h-4" />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SkeletonAccessoryCard;
