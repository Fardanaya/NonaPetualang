"use client";

import React from "react";
import { Card, CardBody, Button, Checkbox, Chip } from "@heroui/react";
import { IoMdClose } from "react-icons/io";
import { ICartItem } from "@/lib/types/schemas/cart";
import { useRemoveFromCart } from "@/hooks/react-query/cart";
import { calcRentalPrice } from "@/lib/utils";

interface CartItemSelectableProps {
  item: ICartItem;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

const CartItemSelectable: React.FC<CartItemSelectableProps> = ({
  item,
  selected,
  onSelect,
}) => {
  const removeFromCart = useRemoveFromCart();

  const itemData = item.catalog || item.accessory;
  const itemName = itemData?.name || "";
  const itemImage = itemData?.images?.[0] || "/placeholder.jpeg";

  let totalPrice = 0;
  if (item.item_type === 'catalog' && item.catalog) {
    const base = calcRentalPrice(item.catalog.price_per_day || 0, item.catalog.prices, item.rental_days);
    totalPrice = base + (item.catalog.price_per_day || 0) * item.additional_days;
  } else if (item.item_type === 'accessory' && item.accessory) {
    totalPrice = (item.accessory.price || 0) * (item.rental_days + item.additional_days);
  }

  return (
    <Card
      className={`w-full transition-colors ${
        selected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
    >
      <CardBody className="p-3">
        <div 
          className="flex gap-3 cursor-pointer" 
          onClick={() => onSelect(item.id!, !selected)}
        >
          {/* Checkbox */}
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              isSelected={selected}
              onValueChange={(val) => onSelect(item.id!, val)}
              size="sm"
            />
          </div>

          {/* Image */}
          <img
            src={itemImage}
            alt={itemName}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpeg";
            }}
          />

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm line-clamp-1">{itemName}</h4>
                <Chip size="sm" variant="flat" className="mt-1 capitalize text-xs">
                  {item.item_type}
                </Chip>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => removeFromCart.mutate(item.id!)}
                  className="text-default-400 hover:text-danger"
                >
                  <IoMdClose size={16} />
                </Button>
              </div>
            </div>

            <div className="mt-2 text-xs text-default-500">
              {item.rental_days} day{item.rental_days !== 1 ? "s" : ""}
              {item.additional_days > 0 && ` + ${item.additional_days} extra`}
              {item.selected_size && ` • Size ${item.selected_size}`}
            </div>

            <div className="mt-1 text-sm font-semibold text-primary">
              Rp {totalPrice.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CartItemSelectable;
