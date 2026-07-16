"use client";

import React, { useState, useEffect } from "react";
import {
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Card,
  CardBody,
  Checkbox,
  ScrollShadow,
  Divider,
} from "@heroui/react";
import { Drawer } from "@/components/ui/heroui";
import { IoMdClose } from "react-icons/io";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUserCart, useRemoveFromCart } from "@/hooks/react-query/cart";
import CartItemSelectable from "./CartItemSelectable";
import { calcRentalPrice } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { data: cartItems, isLoading } = useUserCart();
  const removeFromCart = useRemoveFromCart();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Clear selection when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedItems(new Set());
    }
  }, [isOpen]);

  const totalItems = cartItems?.length || 0;
  const selectedCount = selectedItems.size;
  const isAllSelected = selectedCount === totalItems && totalItems > 0;

  // Calculate total price
  const totalSelectedPrice =
    cartItems?.reduce((total, item) => {
      if (!selectedItems.has(item.id!)) return total;
      
      let rentalPrice = 0;
      if (item.item_type === 'catalog' && item.catalog) {
        const base = calcRentalPrice(item.catalog.price_per_day || 0, item.catalog.prices, item.rental_days);
        rentalPrice = base + (item.catalog.price_per_day || 0) * item.additional_days;
      } else if (item.item_type === 'accessory' && item.accessory) {
        rentalPrice = (item.accessory.price || 0) * (item.rental_days + item.additional_days);
      }
      
      return total + rentalPrice;
    }, 0) || 0;

  const handleSelectItem = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(new Set(cartItems?.map((item) => item.id!) || []));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCount === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedItems).map((id) => removeFromCart.mutateAsync(id))
      );
      setSelectedItems(new Set());
    } catch (error) {
      console.error("Error deleting items:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCheckout = () => {
    if (selectedCount === 0) return;

    const selectedCartItems =
      cartItems?.filter((item) => selectedItems.has(item.id!)) || [];

    const sessionId = `checkout_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    sessionStorage.setItem(
      sessionId,
      JSON.stringify({
        items: selectedCartItems,
        timestamp: Date.now(),
        sessionId,
      })
    );

    onClose();
    router.push(`/checkout/${sessionId}`);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md" hideCloseButton>
      <DrawerContent>
        {/* Header */}
        <DrawerHeader className="border-b border-default-100">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FaShoppingCart className="text-xl text-primary" />
              <h3 className="text-lg font-semibold">
                Cart ({totalItems})
              </h3>
            </div>
            <Button isIconOnly variant="light" size="sm" onPress={onClose}>
              <IoMdClose className="text-xl" />
            </Button>
          </div>
        </DrawerHeader>

        <DrawerBody className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="text-default-500">Loading...</span>
            </div>
          ) : !cartItems || cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FaShoppingCart className="text-4xl text-default-300 mb-3" />
              <p className="text-default-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Select All & Delete */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-default-100">
                <Checkbox
                  isSelected={isAllSelected}
                  onValueChange={handleSelectAll}
                  size="sm"
                >
                  Select All
                </Checkbox>

                {selectedCount > 0 && (
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    isLoading={isDeleting}
                    startContent={!isDeleting && <FaTrash size={12} />}
                    onPress={handleDeleteSelected}
                  >
                    Delete ({selectedCount})
                  </Button>
                )}
              </div>

              {/* Cart Items */}
              <ScrollShadow className="space-y-3 max-h-[55vh]">
                {cartItems.map((item) => (
                  <CartItemSelectable
                    key={item.id}
                    item={item}
                    selected={selectedItems.has(item.id!)}
                    onSelect={handleSelectItem}
                  />
                ))}
              </ScrollShadow>
            </>
          )}
        </DrawerBody>

        {/* Footer - Only show when items selected */}
        {cartItems && cartItems.length > 0 && (
          <DrawerFooter className="flex-col gap-3 border-t border-default-100">
            <Card className="w-full">
              <CardBody className="py-3">
                <div className="flex justify-between items-center">
                  <span className="text-default-600">
                    Total ({selectedCount} items)
                  </span>
                  <span className="text-lg font-bold text-primary">
                    Rp {totalSelectedPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </CardBody>
            </Card>

            <Button
              color="primary"
              className="w-full"
              size="lg"
              isDisabled={selectedCount === 0}
              onPress={handleCheckout}
            >
              Checkout
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
