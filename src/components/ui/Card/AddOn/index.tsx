import { Card, CardBody } from "@heroui/react";
import Image from "next/image";
import { IAddOn } from "@/lib/types/schemas/add-on";

const AddonCard = ({
  item,
  isPressable = true,
  onPress,
  hideStock = false,
}: {
  item?: IAddOn;
  isPressable?: boolean;
  onPress?: () => void;
  hideStock?: boolean;
}) => {
  return (
    <Card isPressable={isPressable} onPress={onPress} shadow="sm" radius="sm">
      <CardBody className="overflow-hidden p-0 flex-row">
        <div className={`flex items-center gap-2 ${hideStock ? "w-full" : "w-[80%]"}`}>
          <div className="relative size-[75px] md:size-[80px] aspect-square">
            <Image
              src={item?.image || "/placeholder.jpeg"}
              alt={item?.name || "-"}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="flex flex-col p-2 md:px-3 w-full">
            <p className="text-medium md:text-lg font-semibold line-clamp-1">
              {item?.name || "-"}
            </p>
            <p className="text-primary text-sm md:text-medium font-semibold line-clamp-1">
              Rp {item?.price.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        {!hideStock && (
          <div className="w-[20%] flex flex-col justify-center items-center p-2">
            <p className="text-2xl text-primary font-semibold">
              {item?.stock || "-"}
            </p>
            <p className="text-[0.6rem] uppercase">Stock</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AddonCard;
