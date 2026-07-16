"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { FaPen, FaTrash } from "react-icons/fa6";
import { FaMapMarkerAlt, FaUser, FaPhone, FaHome, FaInfoCircle } from "react-icons/fa";
import { LuMapPin, LuNavigation } from "react-icons/lu";
import { Button } from "../../heroui";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { IAddress } from "@/lib/types/schemas/address";

const AddressCard = ({
  data,
  onUpdate,
  onDelete,
  hideMap = false,
}: {
  data: IAddress;
  onUpdate: (data: IAddress) => void;
  onDelete: (id: string) => void;
  hideMap?: boolean;
}) => {
  const hasCoordinates = data.latitude && data.longitude;

  // Dynamic import Leaflet map for preview
  const MapPreview = useMemo(
    () =>
      dynamic(
        () => import("./MapPreview"),
        {
          loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-default-100">
              <FaMapMarkerAlt className="text-default-300 text-2xl animate-pulse" />
            </div>
          ),
          ssr: false,
        }
      ),
    []
  );

  return (
    <div className="bg-default-50/50 rounded-xl border border-default-200 overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col lg:flex-row">
        {/* Map Preview - Left Side */}
        <div className="w-full lg:w-56 h-40 lg:h-auto bg-default-100 relative shrink-0 min-h-[160px] z-0">
          {hideMap ? (
            // Hidden map placeholder when modal is open
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-default-100 to-default-200 opacity-60">
              <LuMapPin className="text-default-300 mb-2" size={32} />
              <span className="text-xs text-default-400">Peta tersembunyi</span>
            </div>
          ) : hasCoordinates ? (
            <MapPreview lat={data.latitude!} lng={data.longitude!} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-default-100 to-default-200">
              <LuMapPin className="text-default-300 mb-2" size={32} />
              <span className="text-xs text-default-400">Lokasi belum ditentukan</span>
            </div>
          )}

          {/* Coordinates Badge - Only show when not hidden */}
          {hasCoordinates && !hideMap && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
              <div className="flex items-center gap-1 text-white text-[10px]">
                <LuNavigation size={10} />
                <span>{data.latitude?.toFixed(5)}, {data.longitude?.toFixed(5)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Address Details - Right Side */}
        <div className="flex-1 p-4">
          {/* Header with Label and Actions */}
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded">
                  {data.label || "Alamat"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5 shrink-0">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="bg-primary/10 text-primary"
                onPress={() => onUpdate(data)}
              >
                <FaPen size={12} />
              </Button>
              <Popover placement="left">
                <PopoverTrigger>
                  <Button isIconOnly size="sm" variant="flat" className="bg-danger/10 text-danger">
                    <FaTrash size={12} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="px-3 py-3 flex flex-col gap-3 max-w-[200px]">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-bold">Hapus Alamat?</p>
                      <p className="text-xs text-default-500">
                        Alamat &quot;{data.label}&quot; akan dihapus permanen.
                      </p>
                    </div>
                    <Button
                      startContent={<FaTrash size={12} />}
                      color="danger"
                      size="sm"
                      fullWidth
                      onPress={() => onDelete(data.id || "")}
                    >
                      Ya, Hapus
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Detail Information Grid */}
          <div className="space-y-3">
            {/* Receiver */}
            {data.receiver && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-default-100 flex items-center justify-center shrink-0">
                  <FaUser className="text-default-500" size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-default-400 font-semibold">Penerima</p>
                  <p className="text-sm font-medium truncate">{data.receiver}</p>
                </div>
              </div>
            )}

            {/* Regional Data - Province, City, District, Sub-District, Postal Code */}
            {(data.province || data.city || data.district || data.sub_district) && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <FaMapMarkerAlt className="text-primary" size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-default-400 font-semibold">Wilayah</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-1">
                    {data.province && (
                      <div>
                        <span className="text-[9px] text-default-400">Provinsi</span>
                        <p className="text-xs font-medium leading-tight">{data.province}</p>
                      </div>
                    )}
                    {data.city && (
                      <div>
                        <span className="text-[9px] text-default-400">Kota/Kab</span>
                        <p className="text-xs font-medium leading-tight">{data.city}</p>
                      </div>
                    )}
                    {data.district && (
                      <div>
                        <span className="text-[9px] text-default-400">Kecamatan</span>
                        <p className="text-xs font-medium leading-tight">{data.district}</p>
                      </div>
                    )}
                    {data.sub_district && (
                      <div>
                        <span className="text-[9px] text-default-400">Kelurahan</span>
                        <p className="text-xs font-medium leading-tight">{data.sub_district}</p>
                      </div>
                    )}
                    {data.postal_code && (
                      <div>
                        <span className="text-[9px] text-default-400">Kode Pos</span>
                        <p className="text-xs font-medium leading-tight">{data.postal_code}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Street Address */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-default-100 flex items-center justify-center shrink-0">
                <FaHome className="text-default-500" size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-default-400 font-semibold">Alamat</p>
                <p className="text-sm font-medium line-clamp-2">{data.address || "-"}</p>
              </div>
            </div>

            {/* Address Details / Patokan */}
            {data.address_details && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-default-100 flex items-center justify-center shrink-0">
                  <FaInfoCircle className="text-default-500" size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-default-400 font-semibold">Patokan</p>
                  <p className="text-sm text-default-600 line-clamp-2">{data.address_details}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
