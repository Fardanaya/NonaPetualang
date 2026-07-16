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
}

const CartItem: React.FC<CartItemProps> = ({ item, showRemoveButton = true }) => {
  const removeFromCart = useRemoveFromCart();

  // Get item data from catalog or accessory
  const itemData = item.catalog || item.accessory;
  const itemName = itemData?.name || "";
  const itemImage = itemData?.images?.[0] || "/placeholder.jpeg";
  const categoryName = (itemData as any)?.category?.name || "-";
  const brandName = (itemData as any)?.brand?.name || "-";

  let itemPrice = 0;
  if (item.item_type === 'catalog' && item.catalog) {
     const base = calcRentalPrice(item.catalog.price_per_day || 0, item.catalog.prices, item.rental_days);
     itemPrice = base + (item.catalog.price_per_day || 0) * item.additional_days;
  } else if (item.item_type === 'accessory' && item.accessory) {
     itemPrice = (item.accessory.price || 0) * (item.rental_days + item.additional_days);
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
                {item.rental_days || 1} Hari
              </Chip>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CartItem;
