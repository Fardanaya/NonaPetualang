import { Card, CardBody } from "@heroui/react";
import { Chip } from "../../heroui";
import Link from "next/link";
import Image from "next/image";
import { MdDiscount, MdOutlinePersonPin } from "react-icons/md";
import { formatPrice, formatToLocale } from "@/lib/utils";
import { IAccessory } from "@/lib/types/schemas/accessory";

const AccessoryCard = ({ accessory }: { accessory: IAccessory | any }) => {
  return (
    <Card shadow="sm" radius="sm" className="w-full h-full">
      <CardBody className="overflow-hidden p-0">
        <div className="relative w-full">
          <div className="relative w-full h-full aspect-square">
            <Image
              src={
                accessory?.images?.length > 0
                  ? accessory.images[0]
                  : "/placeholder.jpeg"
              }
              alt={accessory.name}
              fill
              className="object-cover"
            />
          </div>
          {accessory.status !== "available" && (
            <Chip
              className="absolute bottom-2 left-2 z-[15] capitalize"
              variant="shadow"
              type={accessory.status}
              size="xss"
              classNames={{
                base: "py-0.5",
                content: "uppercase font-medium tracking-widest",
              }}
            >
              {accessory.status}
            </Chip>
          )}
        </div>
        <div className="flex flex-col gap-1 justify-between items-start p-2 md:px-3">
          <div className="flex flex-col gap-1 md:gap-0.5">
            <p className="text-xs md:text-medium font-semibold line-clamp-1">
              {accessory.name}
            </p>
            <p className="flex items-center gap-1 font-semibold text-[0.7rem] md:text-sm leading-none text-primary">
              Rp {formatToLocale(accessory.price)} / 3 Hari
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-0.5">
              {accessory.catalog && (
                <div className="flex flex-row items-center gap-1">
                  <MdOutlinePersonPin className="text-[0.65rem] md:text-xs" />
                  <p className="text-[0.6rem] md:text-xs line-clamp-1 italic leading-tight pr-1">
                    {accessory.catalog.name}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1 capitalize">
              <Chip variant="bordered" size="xss" type="accessory">
                {accessory.type}
              </Chip>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const UserAccessoryCard = ({ accessory }: { accessory: IAccessory | any }) => {
  return (
    <Link
      href={`/catalog/${accessory?.slug}`}
      className="hover:scale-105 transition-duration-500 transition-all rounded-lg hover:shadow-2xl"
    >
      <AccessoryCard accessory={accessory} />
    </Link>
  );
};

const AdminAccessoryCard = ({ accessory }: { accessory: IAccessory | any }) => {
  return (
    <Link
      href={`/admin/accessories/edit/${accessory.id}`}
      className="hover:scale-105 transition-duration-500 transition-all rounded-lg hover:shadow-2xl"
    >
      <AccessoryCard accessory={accessory} />
    </Link>
  );
};

export { AccessoryCard, UserAccessoryCard, AdminAccessoryCard };
