import { Card, CardBody } from "@heroui/react";
import { Skeleton } from "../../heroui";

const SkeletonAddonCard = () => {
  return (
    <div>
      <Card shadow="sm" radius="sm" className="w-full h-full">
        <CardBody className="overflow-hidden p-0 flex-row">
          <CardBody className="overflow-hidden p-0 flex-row">
            <div className="w-[80%] flex items-center gap-2">
              <div className="relative size-[75px] md:size-[80px] aspect-square">
                <Skeleton className="rounded-lg aspect-square" />
              </div>
              <div className="flex flex-col gap-1 p-2 md:px-3 w-full">
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-full h-6" />
              </div>
            </div>
            <div className="w-[20%] flex flex-col justify-center gap-1 items-center p-2">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-2" />
            </div>
          </CardBody>
        </CardBody>
      </Card>
    </div>
  );
};

export default SkeletonAddonCard;
