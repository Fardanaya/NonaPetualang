"use client";

import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { IoMdClose } from "react-icons/io";
import { ICartItem } from "@/lib/types/schemas/cart";
import { useRemoveFromCart } from "@/hooks/react-query/cart";
import { Chip } from "@/components/ui/heroui";
import Image from "next/image";
import { cachedImage, formatToLocale, calcRentalPrice } from "@/lib/utils";
import { MdOutlinePersonalVideo, MdOutlinePersonPin } from "react-icons/md";

interface CartItemProps {
  item: ICartItem;
  showRemoveButton?: boolean;
  overrideRentalDays?: number;
}

const CartItem: React.FC<CartItemProps> = ({ item, showRemoveButton = true, overrideRentalDays }) => {
  const removeFromCart = useRemoveFromCart();

  // Get item data from catalog or accessory
  const itemData = item.catalog || item.accessory;
  const itemName = itemData?.name || "";
  const itemImage = itemData?.images?.[0] || "/placeholder.jpeg";
  const categoryName = (itemData as any)?.category?.name || "-";
  const brandName = (itemData as any)?.brand?.name || "-";

  const rentalDays = overrideRentalDays !== undefined ? overrideRentalDays : (item.rental_days || 1);
  const additionalDays = overrideRentalDays !== undefined ? 0 : (item.additional_days || 0);

  let itemPrice = 0;
  let breakdownText = "";

  if (item.item_type === 'catalog' && item.catalog) {
     const pricePerDay = item.catalog.price_per_day || 0;
     const packages = item.catalog.prices;
     const totalDays = rentalDays + additionalDays;
     
     const base = calcRentalPrice(pricePerDay, packages, rentalDays);
     itemPrice = base + pricePerDay * additionalDays;

     if (packages && packages.length > 0) {
       const sorted = [...packages].sort((a, b) => a.days - b.days);
       let bestPkg: { days: number; price: number } | null = null;
       for (const pkg of sorted) {
         if (pkg.days <= totalDays) {
           bestPkg = pkg;
         }
       }

       if (bestPkg) {
         const extraDays = totalDays - bestPkg.days;
         const pkgPrice = bestPkg.price;
         const extraPrice = extraDays * pricePerDay;
         if (extraDays > 0) {
           breakdownText = `Paket ${bestPkg.days} Hari (Rp ${formatToLocale(pkgPrice)}) + ${extraDays} Hari Tambahan (Rp ${formatToLocale(extraPrice)})`;
         } else {
           breakdownText = `Paket ${bestPkg.days} Hari (Rp ${formatToLocale(pkgPrice)})`;
         }
       } else {
         breakdownText = `${totalDays} Hari x Rp ${formatToLocale(pricePerDay)}/hari`;
       }
     } else {
       breakdownText = `${totalDays} Hari x Rp ${formatToLocale(pricePerDay)}/hari`;
     }
  } else if (item.item_type === 'accessory' && item.accessory) {
     const price = item.accessory.price || 0;
     const totalDays = rentalDays + additionalDays;
     itemPrice = price * totalDays;
     breakdownText = `${totalDays} Hari x Rp ${formatToLocale(price)}/hari`;
  }

  const handleRemove = () => {
    removeFromCart.mutate(item.id!);
  };

  return (
    <Card shadow="sm" radius="sm" className="w-full">
      <CardBody className="p-2 md:p-3">
        <div className="flex gap-3 items-center">
          {/* Item Image */}
          <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={cachedImage({ url: itemImage, w: 200 })}
              alt={itemName}
              fill
              className="object-cover"
            />
          </div>

          {/* Item Details */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-medium line-clamp-1">
                  {itemName}
                </h3>
                 <p className="text-primary font-semibold text-xs md:text-sm">
                  Rp {formatToLocale(itemPrice)}
                </p>
                {breakdownText && (
                  <p className="text-[10px] md:text-xs text-default-400 mt-0.5 font-medium">
                    {breakdownText}
                  </p>
                )}
              </div>
              {showRemoveButton && (
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={handleRemove}
                  className="text-default-400 hover:text-danger -mt-1 -mr-1"
                >
                  <IoMdClose size={18} />
                </Button>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-col gap-0.5 mt-1">
              <div className="flex items-center gap-1">
                <MdOutlinePersonalVideo className="text-[0.65rem] md:text-xs text-default-500" />
                <p className="text-[0.6rem] md:text-xs text-default-600 line-clamp-1 italic">
                  {brandName}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <MdOutlinePersonPin className="text-[0.65rem] md:text-xs text-default-500" />
                <p className="text-[0.6rem] md:text-xs text-default-600 line-clamp-1 italic">
                  {categoryName}
                </p>
              </div>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.selected_size && (
                <Chip variant="bordered" size="xss" type="size">
                  {item.selected_size}
                </Chip>
              )}
              <Chip variant="flat" size="xss" color="primary">
                {rentalDays} Hari
              </Chip>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CartItem;
