import { Card, CardBody } from "@heroui/react";
import { Chip } from "../../heroui";
import Link from "next/link";
import Image from "next/image";
import {
  MdDiscount,
  MdOutlinePersonalVideo,
  MdOutlinePersonPin,
} from "react-icons/md";
import { cachedImage, formatPrice, formatToLocale } from "@/lib/utils";
import { TbArrowBigDownFilled, TbArrowBigUpFilled } from "react-icons/tb";
import { ICatalog } from "@/lib/types/schemas/catalog";

const CatalogCard = ({ catalog }: { catalog: ICatalog | any }) => {
  const bundlePrice = () => {
    return catalog?.bundle_catalog.reduce(
      (total: number, item: ICatalog) => total + (item.price_per_day || 0),
      0
    );
  };

  return (
    <Card shadow="sm" radius="sm" className="w-full h-full">
      <CardBody className="overflow-hidden p-0">
        <div className="relative w-full">
          <div className="relative w-full h-full aspect-square">
            <Image
              src={
                catalog?.images?.length > 0
                  ? cachedImage({
                      url: catalog?.images[0],
                      w: 400,
                    })
                  : "/placeholder.jpeg"
              }
              alt={catalog?.name || "-"}
              fill
              className="object-cover"
            />
          </div>
          {catalog?.status !== "ready" && (
            <Chip
              className="absolute bottom-2 left-2 z-15 capitalize"
              variant="shadow"
              type={catalog?.status}
              size="xss"
              classNames={{
                base: "py-0.5",
                content: "uppercase font-medium tracking-widest",
              }}
            >
              {catalog?.status}
            </Chip>
          )}
        </div>
        <div className="flex flex-col gap-1 justify-between catalogs-start p-2 md:px-3">
          <div className="flex flex-col gap-1 md:gap-0.5">
            <p className="text-xs md:text-medium font-semibold line-clamp-1">
              {catalog?.name}
            </p>
            {catalog?.bundle_catalog && catalog?.bundle_catalog.length > 0 ? (
              <div className="flex catalogs-center gap-2 font-semibold text-[0.65rem] md:text-sm leading-none">
                <p className="text-primary">
                  Rp {formatPrice(catalog?.price_per_day)} / 1 Hari
                </p>
                {catalog?.price_per_day < bundlePrice() ? (
                  <TbArrowBigDownFilled className="text-success" />
                ) : (
                  <TbArrowBigUpFilled className="text-danger" />
                )}
                <p className="text-default-600 line-through">
                  Rp {formatPrice(bundlePrice())}
                </p>
              </div>
            ) : (
              <p className="flex catalogs-center gap-1 font-semibold text-[0.7rem] md:text-sm leading-none text-primary">
                Rp {formatToLocale(catalog?.price_per_day)} / 1 Hari
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-row catalogs-center gap-1">
                <MdOutlinePersonPin className="text-[0.65rem] md:text-xs" />
                <p className=" text-[0.6rem] md:text-xs line-clamp-1 italic leading-tight pr-1">
                  {catalog?.bundle_catalog && catalog?.bundle_catalog.length > 0
                    ? (() => {
                        const names = Array.from(
                          new Set(
                            catalog?.bundle_catalog.map(
                              (catalog: any) => catalog?.category?.name
                            )
                          )
                        ).filter(Boolean);

                        if (names.length === 0)
                          return catalog?.category?.name ?? "-";
                        if (names.length === 1) return names[0];
                        if (names.length === 2) return names.join(" & ");
                        return `${names.slice(0, -1).join(", ")} & ${
                          names[names.length - 1]
                        }`;
                      })()
                    : catalog?.category?.name ?? "-"}
                </p>
              </div>
              {!(
                catalog?.bundle_catalog && catalog?.bundle_catalog.length > 0
              ) && (
                <div className="flex flex-row catalogs-center gap-1">
                  <MdDiscount className="text-[0.65rem] md:text-xs" />
                  <p className=" text-[0.6rem] md:text-xs line-clamp-1 italic leading-tight pr-1">
                    {catalog?.brand?.name ?? "-"}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {catalog?.capacity && catalog?.capacity > 0 && (
                <Chip variant="bordered" size="xss" type="size">
                  {catalog.capacity} {catalog.capacity_unit || "Orang"}
                </Chip>
              )}
              {catalog?.weight && catalog?.weight > 0 && (
                <Chip variant="bordered" size="xss" type="size">
                  {catalog.weight} Kg
                </Chip>
              )}
            </div>
            <div className="flex flex-wrap gap-1 capitalize">
              {catalog?.bundle_catalog &&
                catalog?.bundle_catalog.length > 0 && (
                  <Chip variant="bordered" size="xss" bundle="yes">
                    Bundle
                  </Chip>
                )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const UserCatalogCard = ({ catalog }: { catalog: ICatalog | any }) => {
  return (
    <Link
      href={`/catalog/${catalog?.slug}`}
      className="hover:scale-105 transition-duration-500 transition-all rounded-lg hover:shadow-2xl"
    >
      <CatalogCard catalog={catalog} />
    </Link>
  );
};




const AdminCatalogCard = ({ catalog }: { catalog: ICatalog | any }) => {
  return (
    <Link
      href={`/admin/catalog/edit/${catalog?.id}`}
      className="hover:scale-105 transition-duration-500 transition-all rounded-lg hover:shadow-2xl"
    >
      <CatalogCard catalog={catalog} />
    </Link>
  );
};

export { CatalogCard, UserCatalogCard, AdminCatalogCard };
