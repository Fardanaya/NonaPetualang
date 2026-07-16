import { Card, CardBody } from "@heroui/react";
import { FaHeart, FaCalendarAlt } from "react-icons/fa";
import Image from "next/image";
import { IWishlistCardProps } from "@/lib/types/schemas/wishlist-items";

const WishlistCard = ({ wishlist, onEdit }: IWishlistCardProps) => {
  const catalogs = wishlist.wishlist_items?.slice(0, 3) || [];
  const remainingCount = (wishlist.wishlist_items?.length || 0) - 3;

  return (
    <Card
      shadow="sm"
      radius="sm"
      className="w-full h-full hover:scale-105 transition-all cursor-pointer"
    >
      <CardBody
        className="p-4"
        onClick={() => {
          console.log('Card clicked', wishlist, onEdit);
          if (onEdit) onEdit(wishlist);
        }}
      >
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1 flex-1">
              <h3 className="font-semibold text-sm line-clamp-2">
                {wishlist.wishlist_name}
              </h3>
              {wishlist.date && (
                <div className="flex items-center gap-1 text-xs ">
                  <FaCalendarAlt size={10} />
                  <span>{new Date(wishlist.date).toLocaleDateString('id-ID')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Catalogs Preview */}
          {catalogs.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {catalogs.map((item, idx) => (
                  <div
                    key={item.catalog.id}
                    className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm"
                    style={{ zIndex: catalogs.length - idx }}
                  >
                    <Image
                      src={item.catalog.images?.[0] || "/placeholder.jpeg"}
                      alt={item.catalog.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <p className="text-xs text-default-600">
                  {wishlist.wishlist_items?.length} katalog
                </p>
                {remainingCount > 0 && (
                  <p className="text-xs text-default-400">
                    +{remainingCount} lagi
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export { WishlistCard };
