"use client";

import {
  MdDiscount,
  MdOutlinePersonalVideo,
  MdOutlinePersonPin,
} from "react-icons/md";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { EmblaOptionsType } from "embla-carousel";
import {
  Accordion,
  AccordionItem,
  DateValue,
  Divider,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure,
} from "@heroui/react";
import {
  AvailabilityCalendar,
  CatalogCalendar,
} from "@/components/ui/Calendar";
import { FaCalendar, FaRegClock } from "react-icons/fa6";
import { Button, Chip, Modal, Skeleton } from "@/components/ui/heroui";
import { FaHeart, FaInfoCircle } from "react-icons/fa";
import { BsChatFill } from "react-icons/bs";
import { FaCartShopping } from "react-icons/fa6";
import { useAddToCart } from "@/hooks/react-query/cart";
import { useCheckWishlistItem, useToggleWishlist } from "@/hooks/react-query/wishlist";
import { TbArrowBigDownFilled, TbArrowBigUpFilled } from "react-icons/tb";
import { Section, SectionTitle } from "@/components/ui/Section";
import { metadataConfig } from "@/app/config";
import { ICatalog } from "@/lib/types/schemas/catalog";
import { UserCatalogCard } from "@/components/ui/Card/Catalog";
import SkeletonCatalogCard from "@/components/ui/Card/Catalog/Skeleton";
import { useSession } from "@/components/providers/SessionProvider";
import { useCatalogBySlug, useCatalog } from "@/hooks/react-query/catalog";
import { useAccessoryBySlug } from "@/hooks/react-query/accessories";
import { useBookedDatesForCatalogItems, useBookedDatesForAccessoryItems } from "@/hooks/react-query/transaction";
import { useVouchers } from "@/hooks";
import Link from "next/link";
import EmblaCarousel from "@/components/ui/Carousel";
import Image from "next/image";
import moment from "moment";

const OPTIONS: EmblaOptionsType = { loop: true };

// ===================== CATALOG DETAIL COMPONENT =====================
const CatalogDetail = ({
  model,
  loading,
  loadPage,
  catalogBundle,
  bookedDates
}: {
  model: any;
  loading: boolean;
  loadPage: boolean;
  catalogBundle: ICatalog[];
  bookedDates: Date[];
}) => {
  const router = useRouter();
  const { user } = useSession();
  const { isOpen, onOpenChange, onClose } = useDisclosure();
  const { data: vouchers } = useVouchers({ is_enable: true });
  const addToCartMutation = useAddToCart();
  const { data: wishlistItem } = useCheckWishlistItem(user?.id, model?.id);
  const addToWishlistMutation = useToggleWishlist();

  const bundlePrice = () => {
    return catalogBundle.reduce((total, item) => total + (item.price_per_day ?? 0), 0);
  };

  const isDateUnavailable = (date: DateValue) => {
    const today = moment().startOf('day');
    const checkDate = moment(date.toString()).startOf('day');

    if (checkDate.isBefore(today)) {
      return true;
    }

    return bookedDates.some((bookedDate) =>
      moment(bookedDate).isSame(checkDate, 'day')
    );
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (model?.id) {
      const defaultDays = model.prices && model.prices.length > 0 ? model.prices[0].days : 1;
      addToCartMutation.mutate({
        item_type: "catalog",
        item_id: model.id,
        rental_days: defaultDays,
      });
    }
  };

  const handleAddToWishlist = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (model?.id) {
      addToWishlistMutation.mutate({
        catalog_id: model.id,
        user_id: user.id,
      });
    }
  };

  const handleDirectCheckout = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const defaultDays = model?.prices && model.prices.length > 0 ? model.prices[0].days : 1;

    const checkoutItem = {
      id: `direct_${model?.id}_${Date.now()}`,
      item_type: "catalog" as const,
      item_id: model?.id,
      catalog: model,
      rental_days: defaultDays,
      additional_days: 0,
    };

    const sessionId = `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const sessionData = {
      items: [checkoutItem],
      timestamp: Date.now(),
    };

    sessionStorage.setItem(sessionId, JSON.stringify(sessionData));
    router.push(`/checkout/${sessionId}`);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8 py-4">
      <div className="relative flex flex-col md:flex-row gap-4">
        <div className="static md:sticky md:top-4 h-fit w-full md:w-[40%] flex flex-col gap-4">
          <Section>
            {loadPage || loading ? (
              <div className="flex flex-col gap-2 w-full">
                <div className="w-full aspect-square">
                  <Skeleton className="w-full h-full rounded-lg" />
                </div>
                <div className="hidden md:flex gap-2">
                  <Skeleton className="size-16 rounded-lg" />
                  <Skeleton className="size-16 rounded-lg" />
                  <Skeleton className="size-16 rounded-lg" />
                  <Skeleton className="size-16 rounded-lg" />
                  <Skeleton className="size-16 rounded-lg" />
                  <Skeleton className="size-16 rounded-lg" />
                </div>
              </div>
            ) : (
              <EmblaCarousel slides={model?.images || []} options={OPTIONS} />
            )}
          </Section>


          <Section
            className={`w-[100%] flex flex-col gap-2 px-3 py-2 ${!(
              model?.bundle_catalog &&
              model.bundle_catalog.length > 0 &&
              catalogBundle.length > 0
            )
              ? "hidden"
              : ""
              }`}
          >
            <div className="flex flex-col gap-4">
              <SectionTitle
                title="Include"
                description="Termasuk dalam bundle ini"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {catalogBundle.map((item: any, index: number) => (
                  <div key={item?.id} className="flex flex-col gap-1 h-full">
                    <div className="flex justify-center items-center">
                      <p className="text-primary text-sm font-semibold uppercase">
                        Catalog {index + 1}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center gap-2 h-full">
                      <UserCatalogCard catalog={item} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
          <Divider className="opacity-20 hidden md:block" />
        </div>
        <div className="flex flex-col  gap-3 md:gap-5 w-full  md:w-[70%]">
          <div className="flex flex-col gap-0.5 md:gap-1 w-full">
            {loadPage || loading ? (
              <Skeleton className="w-full h-7 md:h-9" />
            ) : (
              <h1 className="text-xl md:text-2xl font-semibold">
                {model?.name}
              </h1>
            )}
            {loadPage || loading ? (
              <Skeleton className="w-[80%] h-6" />
            ) : model?.bundle_catalog && model.bundle_catalog.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2 text-primary">
                  <p className="text-primary font-semibold leading-none">
                    Mulai dari Rp {(model?.price_per_day ?? 0).toLocaleString("id-ID")} / Hari
                  </p>
                  <div className="flex items-center gap-2">
                    {(model?.price_per_day ?? 0) < bundlePrice() ? (
                      <TbArrowBigDownFilled className="text-success" />
                    ) : (
                      <TbArrowBigUpFilled className="text-danger" />
                    )}
                    <p className="text-default-600 font-medium line-through  leading-none">
                      Rp {bundlePrice().toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <p className="text-default-800 text-[0.75rem] leading-none">
                  {(model?.price_per_day ?? 0) < bundlePrice()
                    ? `Hemat`
                    : `Lebih Mahal`}{" "}
                  Rp {Math.abs(bundlePrice() - (model?.price_per_day ?? 0))}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-1 w-full">
                <p className="text-default-700 font-medium text-sm md:text-base">Pilihan Paket Sewa:</p>
                <div className="flex flex-col gap-2 mt-1 w-full md:w-[80%]">
                  <div className="flex justify-between items-center border-2 border-primary/20 bg-primary/5 rounded-lg p-3">
                     <span className="font-semibold text-primary">1 Hari</span>
                     <span className="font-bold text-lg text-primary">Rp {(model?.price_per_day ?? 0).toLocaleString("id-ID")}</span>
                  </div>
                  {model?.prices?.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center border-2 border-default-100 rounded-lg p-3">
                       <span className="font-medium text-default-700">{p.days} Hari</span>
                       <span className="font-bold text-lg text-default-900">Rp {p.price.toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="block  text-sm flex flex-col gap-1">
            <div className="flex flex-row gap-4 items-start">
              <div className="w-[35%] flex flex-row gap-1 items-center">
                <MdOutlinePersonPin />
                <p>Kategori</p>
              </div>
              <div className="w-[65%]">
                {loadPage || loading ? (
                  <Skeleton className="w-full h-4" />
                ) : model?.bundle_catalog &&
                  model.bundle_catalog.length > 0 &&
                  catalogBundle.length > 0 ? (
                  (() => {
                    const names = Array.from(
                      new Set(
                        catalogBundle.map(
                          (catalog: any) => catalog?.category?.name
                        )
                      )
                    ).filter(Boolean);

                    if (names.length === 0) return model?.category?.name;
                    if (names.length === 1) return names[0];
                    if (names.length === 2) return names.join(" & ");
                    return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]
                      }`;
                  })()
                ) : (
                  <p>{model?.category?.name}</p>
                )}
              </div>
            </div>
            <div className="flex flex-row gap-4 items-start">
              <div className="flex w-[35%] flex-row gap-1 items-center">
                <MdOutlinePersonalVideo />
                <p>Brand</p>
              </div>
              <div className="w-[65%]">
                {loadPage || loading ? (
                  <Skeleton className="w-full h-4" />
                ) : (
                  <p>{model?.brand?.name ?? "-"}</p>
                )}
              </div>
            </div>
            <div className="flex flex-row gap-4 items-start">
              <div className="flex w-[35%] flex-row gap-1 items-center">
                <MdDiscount />
                <p>Tags</p>
              </div>
              <div className="w-[65%]">
                {loadPage || loading ? (
                  <Skeleton className="w-full h-4" />
                ) : model?.tags && model.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {model.tags.map((tag: string, index: number) => (
                      <Chip key={index} size="sm" variant="flat" color="primary">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                ) : (
                  <p>-</p>
                )}
              </div>
            </div>
            {!loading &&
              !(model?.bundle_catalog && model.bundle_catalog.length > 0) && (
                <div className="flex gap-4 items-start">
                  <div className="w-[35%] flex flex-row gap-1 items-center">
                    <FaInfoCircle />
                    <p>Kapasitas</p>
                  </div>
                  <div className="w-[65%]">
                    {loadPage || loading ? (
                      <Skeleton className="w-full h-4" />
                    ) : model?.capacity && model?.capacity > 0 ? (
                      <p>{model.capacity} {model.capacity_unit || "Orang"}</p>
                    ) : (
                      <p>-</p>
                    )}
                  </div>
                </div>
              )}
          </div>

          <div className="block md:hidden flex gap-2">
            {loadPage || loading ? (
              <>
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-16 h-6" />
              </>
            ) : (
              <>
                {!(
                  model?.bundle_catalog && model.bundle_catalog.length > 0
                ) && (
                    <>
                      {model?.capacity && model?.capacity > 0 && (
                        <Chip variant="bordered" size="sm" type="size">
                          {model.capacity} {model.capacity_unit || "Orang"}
                        </Chip>
                      )}
                      {model?.weight && model?.weight > 0 && (
                        <Chip variant="bordered" size="sm" type="size">
                          {model.weight} Kg
                        </Chip>
                      )}
                    </>
                  )}
                {model?.bundle_catalog && model.bundle_catalog.length > 0 && (
                  <Chip variant="bordered" size="sm" bundle="yes">
                    Bundle
                  </Chip>
                )}
              </>
            )}
          </div>

          <Accordion
            showDivider={false}
          >
            <AccordionItem key="description" aria-label="Deskripsi" title="Deskripsi">
              {loading || loadPage ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="w-full h-4" />
                  ))}
                  <Skeleton className="w-[80%] h-4" />
                </div>
              ) : (
                <div
                  className="text-sm bg-default-100 rounded-lg p-4"
                  dangerouslySetInnerHTML={{ __html: model?.description || "Tidak ada deskripsi" }}
                ></div>
              )}
            </AccordionItem>

            <AccordionItem key="details" aria-label="Detail" title="Detail">
              <div className="grid grid-cols-2 gap-2 bg-default-100 rounded-lg p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Berat</span>
                  <span className="font-medium text-sm">
                    {model?.weight ?? 0} <span className="text-xs">Kg</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Tinggi</span>
                  <span className="font-medium text-sm">
                    {model?.height ?? 0} <span className="text-xs">Cm</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Lebar</span>
                  <span className="font-medium text-sm">
                    {model?.width ?? 0} <span className="text-xs">Cm</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Panjang</span>
                  <span className="font-medium text-sm">
                    {model?.length ?? 0} <span className="text-xs">Cm</span>
                  </span>
                </div>
              </div>
            </AccordionItem>
          </Accordion>
          <Divider className="opacity-20 hidden md:block" />



          <Section className="px-3 py-3">
            <div className="flex items-center gap-2 mb-2">
              <FaInfoCircle className="text-warning" />
              <p className="font-medium text-warning">Informasi Penting</p>
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: model?.important_info || "Tidak ada informasi penting" }}
            ></div>
          </Section>


          <Divider className="opacity-20 block md:hidden" />
          <div className="flex flex-col md:flex-row gap-2 w-full pb-2">
            <div className="flex flex-col w-full md:w-[45%] gap-2">
              {/* SECTION KALENDER (lebih kecil) */}
              <Section className="w-full px-3 py-2">
                <div className="flex flex-col mb-2 w-full">
                  <p className="font-medium md:text-lg text-primary">
                    Jadwal Sewa
                  </p>
                  <p className="text-[0.7rem] text-default-600">
                    Berikut merupakan jadwal ketersediaan alat
                  </p>
                </div>
                <AvailabilityCalendar isDateUnavailable={isDateUnavailable} />
              </Section>
            </div>

            {/* SECTION VOUCHER + PESAN (lebih besar) */}
            <div className="flex flex-col w-full md:w-[55%] gap-2">
              {/* Voucher */}
              <Section className="w-full py-2 px-3">
                <div className="flex flex-col py-2">
                  <Accordion>
                    <AccordionItem
                      classNames={{
                        title: "font-medium md:text-lg text-primary",
                      }}
                      title="List voucher"
                    >
                      {vouchers
                        ?.filter((voucher: any) => voucher?.is_enable)
                        ?.map((voucher: any) => {
                          const isFixed = voucher.discount_type === "fixed";
                          const discountLabel = isFixed
                            ? `Rp. ${voucher.discount_value}`
                            : `${voucher.discount_value}%`;

                          return (
                            <div
                              key={voucher.code}
                              className="flex flex-col gap-1 h-full border-b border-gray-200 py-2 last:border-none"
                            >
                              <p className="text-primary text-sm font-semibold uppercase">
                                {voucher.code} - {discountLabel} OFF
                              </p>
                            </div>
                          );
                        })}
                    </AccordionItem>
                  </Accordion>
                </div>
              </Section>

              {/* Harga & Aksi */}

              <Section className="w-full flex flex-col gap-2 px-3 py-2">
                <div className="flex flex-col gap-1 w-full mb-1">
                  <p className="text-sm font-semibold text-default-700">Mulai dari</p>
                  <div className="flex flex-row items-end gap-1">
                    <p className="text-primary text-2xl font-bold leading-none">
                      Rp {(model?.price_per_day ?? 0).toLocaleString("id-ID")}
                    </p>
                    <p className="text-default-600 text-sm leading-none mb-0.5">
                      / hari
                    </p>
                  </div>
                  <p className="text-xs text-default-500 mt-1 italic">*Tersedia pilihan paket sewa lainnya</p>
                </div>

                <div>
                  <FaInfoCircle className="inline text-default-600 mr-1" />
                  <p className="inline text-xs text-default-800">
                    Estimasi Ongkir { }
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <FaRegClock className="text-primary" />
                  <p className="text-default-800">
                    Estimasi Pengiriman 1 - 3 Hari
                  </p>
                </div>

                <Divider className="opacity-20 my-2" />

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Button
                      fullWidth
                      color="primary"
                      startContent={<BsChatFill />}
                      as={Link}
                      target="_blank"
                      href={`https://wa.me/${metadataConfig.contact.whatsapp}?text=Halo kak ${metadataConfig.name}, Mau nanya nih soal alat sewa ${model?.name}... `}
                    >
                      Hubungi Kami
                    </Button>

                    <Button
                      color="success"
                      variant="flat"
                      isIconOnly
                      onPress={handleAddToCart}
                      isLoading={addToCartMutation.isPending}
                    >
                      <FaCartShopping />
                    </Button>
                  </div>

                  <Button
                    fullWidth
                    color="primary"
                    startContent={<FaCalendar />}
                    onPress={handleDirectCheckout}
                  >
                    Sewa Sekarang
                  </Button>
                </div>

                <p className="text-[0.7rem] text-default-800 leading-[1.1]">
                  * Deposit dan ongkir akan dihitung setelah pengajuan sewa
                </p>
              </Section>
            </div>
          </div>
        </div>
      </div>

      <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Syarat dan Ketentuan</ModalHeader>
              <ModalBody>
                <div className="text-sm">
                  <p className="mb-4">
                    Dengan menggunakan layanan kami, Anda menyetujui syarat dan
                    ketentuan berikut:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Penyewa bertanggung jawab penuh atas kondisi alat selama
                      masa sewa
                    </li>
                    <li>
                      Alat harus dikembalikan dalam kondisi bersih dan tidak
                      rusak
                    </li>
                    <li>
                      Denda akan dikenakan untuk keterlambatan pengembalian
                    </li>
                    <li>
                      Biaya perbaikan akan ditanggung penyewa jika terjadi
                      kerusakan
                    </li>
                    <li>
                      Pembatalan sewa harus dilakukan minimal 24 jam sebelum
                      tanggal sewa
                    </li>
                  </ul>
                </div>
                <div className="flex items-center gap-2">
                  <FaInfoCircle />
                  <p className="text-xs">
                    {model?.status === "soon"
                      ? "Dengan melakukan pre order, Anda menyetujui syarat dan ketentuan sewa di situs kami."
                      : "Dengan melakukan sewa, Anda menyetujui syarat dan ketentuan sewa di situs kami."}
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Tutup</Button>
                <Button
                  color="success"
                  onPress={() => {
                    if (!user) {
                      router.push("/auth/login");
                      return;
                    }
                    if (model?.status === "soon") {
                      router.push(`/catalog/${model?.id}/po`);
                    } else {
                      router.push(`/catalog/${model?.id}/rent`);
                    }
                  }}
                >
                  Setuju
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

// ===================== ACCESSORY DETAIL COMPONENT =====================
const AccessoryDetail = ({
  model,
  loading,
  loadPage,
  bookedDates
}: {
  model: any;
  loading: boolean;
  loadPage: boolean;
  bookedDates: Date[];
}) => {
  const router = useRouter();
  const { user } = useSession();
  const addToCartMutation = useAddToCart();
  const { data: vouchers } = useVouchers({ is_enable: true });
  const { isOpen: isRelatedCostumeModalOpen, onOpen: onOpenRelatedCostumeModal, onOpenChange: onOpenChangeRelatedCostumeModal, onClose: onCloseRelatedCostumeModal } = useDisclosure();
  const { isOpen: isCheckoutModalOpen, onOpen: onOpenCheckoutModal, onOpenChange: onOpenChangeCheckoutModal, onClose: onCloseCheckoutModal } = useDisclosure();
  const [isAddingWithCostume, setIsAddingWithCostume] = useState(false);

  const isDateUnavailable = (date: DateValue) => {
    const today = moment().startOf('day');
    const checkDate = moment(date.toString()).startOf('day');

    if (checkDate.isBefore(today)) {
      return true;
    }

    return bookedDates.some((bookedDate) =>
      moment(bookedDate).isSame(checkDate, 'day')
    );
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Check if accessory has related costume
    if (model?.catalog) {
      onOpenRelatedCostumeModal();
      return;
    }

    if (model?.id) {
      addToCartMutation.mutate({
        item_type: "accessory",
        item_id: model.id,
      });
    }
  };

  const handleConfirmAddWithCostume = async () => {
    if (!user || !model?.id) return;

    setIsAddingWithCostume(true);
    try {
      // Add related costume first
      if (model?.catalog?.id) {
        await addToCartMutation.mutateAsync({
          item_type: "catalog",
          item_id: model.catalog.id,
        });
      }

      // Then add the accessory
      await addToCartMutation.mutateAsync({
        item_type: "accessory",
        item_id: model.id,
      });

      onCloseRelatedCostumeModal();
    } catch (error) {
      console.error("Error adding items to cart:", error);
    } finally {
      setIsAddingWithCostume(false);
    }
  };

  const handleDirectCheckout = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Check if accessory has related costume
    if (model?.catalog) {
      onOpenCheckoutModal();
      return;
    }

    const checkoutItem = {
      id: `direct_${model?.id}_${Date.now()}`,
      user_id: user.id,
      item_type: "accessory" as const,
      item_id: model?.id,
      rental_days: 3,
      additional_days: 0,
      accessory: {
        id: model?.id,
        name: model?.name,
        type: model?.type,
        price: model?.price || 0,
        additional_day_price: model?.additional_day_price || 0,
        images: model?.images || [],
      },
    };

    const sessionId = `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const sessionData = {
      items: [checkoutItem],
      timestamp: Date.now(),
    };

    sessionStorage.setItem(sessionId, JSON.stringify(sessionData));
    router.push(`/checkout/${sessionId}`);
  };

  const handleConfirmCheckoutWithCostume = () => {
    if (!user || !model?.id) return;

    const items = [];

    // Add related costume as checkout item
    if (model?.catalog?.id) {
      items.push({
        id: `direct_${model.catalog.id}_${Date.now()}`,
        user_id: user.id,
        item_type: "catalog" as const,
        item_id: model.catalog.id,
        rental_days: 3,
        additional_days: 0,
        selected_size: model.catalog.size,
        catalog: {
          id: model.catalog.id,
          name: model.catalog.name,
          price: model.catalog.price || 0,
          additional_day_price: model.catalog.additional_day_price || 0,
          images: model.catalog.images || [],
          slug: model.catalog.slug,
        },
      });
    }

    // Add accessory as accessoriesSelected (not as separate checkout item)
    // This links the accessory to its related catalog
    const accessoriesSelected = [{
      id: model.id,
      name: model.name,
      price: model.price || 0,
      catalog_id: model.catalog?.id || null,
      additional_day_price: model.additional_day_price || 0,
    }];

    const sessionId = `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const sessionData = {
      items: items,
      accessoriesSelected: accessoriesSelected,
      timestamp: Date.now(),
    };

    sessionStorage.setItem(sessionId, JSON.stringify(sessionData));
    onCloseCheckoutModal();
    router.push(`/checkout/${sessionId}`);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8 py-4">
      <div className="relative flex flex-col md:flex-row gap-4">
        <div className="static md:sticky md:top-4 h-fit w-full md:w-[40%] flex flex-col gap-4">
          <Section>
            {loadPage || loading ? (
              <div className="flex flex-col gap-2 w-full">
                <div className="w-full aspect-square">
                  <Skeleton className="w-full h-full rounded-lg" />
                </div>
                <div className="hidden md:flex gap-2">
                  <Skeleton className="size-16 rounded-lg" />
                  <Skeleton className="size-16 rounded-lg" />
                  <Skeleton className="size-16 rounded-lg" />
                </div>
              </div>
            ) : (
              <EmblaCarousel slides={model?.images || []} options={OPTIONS} />
            )}
          </Section>

          <Divider className="opacity-20" />

          {/* Accessory Type Info */}
          <div className="text-sm flex flex-col gap-1 hidden md:block">
            <div className="flex flex-row gap-4 items-start">
              <div className="w-[35%] flex flex-row gap-1 items-center">
                <MdDiscount />
                <p>Tipe</p>
              </div>
              <div className="w-[65%]">
                {loadPage || loading ? (
                  <Skeleton className="w-full h-4" />
                ) : (
                  <p className="capitalize">{model?.type}</p>
                )}
              </div>
            </div>
          </div>

          {/* Related Costume Card - Desktop */}
          {model?.catalog && (
            <div className="hidden md:block w-[150px]">
              <p className="text-sm font-medium mb-2 text-default-600">Alat Terkait</p>
              {loadPage || loading ? (
                <SkeletonCatalogCard />
              ) : (
                <UserCatalogCard catalog={model.catalog} />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 md:gap-5 w-full md:w-[70%]">
          <div className="flex flex-col gap-0.5 md:gap-1 w-full">
            {loadPage || loading ? (
              <Skeleton className="w-full h-7 md:h-9" />
            ) : (
              <h1 className="text-xl md:text-2xl font-semibold">
                {model?.name}
              </h1>
            )}
            {loadPage || loading ? (
              <Skeleton className="w-[80%] h-6" />
            ) : (
              <div className="flex flex-col items-start gap-1">
                <p className="text-primary text-xl md:text-3xl font-semibold leading-none">
                  Rp {(model?.price ?? 0).toLocaleString("id-ID")} / 3 hari
                </p>
                <p className="text-default-700 text-[1rem]">
                  Perpanjangan : Rp {model?.additional_day_price} / 1 Hari
                </p>
              </div>
            )}
          </div>

          {/* Mobile View */}
          <div className="block md:hidden text-sm flex flex-col gap-1">
            <div className="flex flex-row gap-4 items-start">
              <div className="w-[35%] flex flex-row gap-1 items-center">
                <MdDiscount />
                <p>Tipe</p>
              </div>
              <div className="w-[65%]">
                {loadPage || loading ? (
                  <Skeleton className="w-full h-4" />
                ) : (
                  <p className="capitalize">{model?.type}</p>
                )}
              </div>
            </div>
          </div>


          {/* Related Costume Card - Mobile */}
          {model?.catalog && (
            <div className="block md:hidden max-w-[150px]">
              <p className="text-sm font-medium mb-2 text-default-600">Alat Terkait</p>
              {loadPage || loading ? (
                <SkeletonCatalogCard />
              ) : (
                <UserCatalogCard catalog={model.catalog} />
              )}
            </div>
          )}

          <Accordion
            showDivider={false}
          >
            <AccordionItem key="description" aria-label="Deskripsi" title="Deskripsi">
              {loading || loadPage ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="w-full h-4" />
                  ))}
                  <Skeleton className="w-[80%] h-4" />
                </div>
              ) : (
                <div
                  className="text-sm bg-default-100 rounded-lg p-4"
                  dangerouslySetInnerHTML={{ __html: model?.description || "Tidak ada deskripsi" }}
                ></div>
              )}
            </AccordionItem>

            <AccordionItem key="details" aria-label="Detail" title="Detail">
              <div className="grid grid-cols-2 gap-2 bg-default-100 rounded-lg p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Berat</span>
                  <span className="font-medium text-sm">
                    {model?.weight ?? 0} <span className="text-xs">Kg</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Tinggi</span>
                  <span className="font-medium text-sm">
                    {model?.height ?? 0} <span className="text-xs">Cm</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Lebar</span>
                  <span className="font-medium text-sm">
                    {model?.width ?? 0} <span className="text-xs">Cm</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Panjang</span>
                  <span className="font-medium text-sm">
                    {model?.length ?? 0} <span className="text-xs">Cm</span>
                  </span>
                </div>
              </div>
            </AccordionItem>
          </Accordion>
          <Divider className="opacity-20 hidden md:block" />

          <Section className="px-3 py-3">
            <div className="flex items-center gap-2 mb-2">
              <FaInfoCircle className="text-warning" />
              <p className="font-medium text-warning">Informasi Penting</p>
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: model?.important_info || "Tidak ada informasi penting" }}
            ></div>
          </Section>

          <Divider className="opacity-20 block md:hidden" />
          <div className="flex flex-col md:flex-row gap-2 w-full pb-2">
            <div className="flex flex-col w-full md:w-[45%] gap-2">
              {/* SECTION KALENDER */}
              <Section className="w-full px-3 py-2">
                <div className="flex flex-col mb-2 w-full">
                  <p className="font-medium md:text-lg text-primary">
                    Jadwal Sewa
                  </p>
                  <p className="text-[0.7rem] text-default-600">
                    Berikut merupakan jadwal ketersediaan aksesoris
                  </p>
                </div>
                <AvailabilityCalendar isDateUnavailable={isDateUnavailable} />
              </Section>
            </div>

            <div className="flex flex-col w-full md:w-[55%] gap-2">

              {/* Voucher */}
              <Section className="w-full py-2 px-3">
                <div className="flex flex-col py-2">
                  <Accordion>
                    <AccordionItem
                      classNames={{
                        title: "font-medium md:text-lg text-primary",
                      }}
                      title="List voucher"
                    >
                      {vouchers
                        ?.filter((voucher: any) => voucher?.is_enable)
                        ?.map((voucher: any) => {
                          const isFixed = voucher.discount_type === "fixed";
                          const discountLabel = isFixed
                            ? `Rp. ${voucher.discount_value}`
                            : `${voucher.discount_value}%`;

                          return (
                            <div
                              key={voucher.code}
                              className="flex flex-col gap-1 h-full border-b border-gray-200 py-2 last:border-none"
                            >
                              <p className="text-primary text-sm font-semibold uppercase">
                                {voucher.code} - {discountLabel} OFF
                              </p>
                            </div>
                          );
                        })}
                    </AccordionItem>
                  </Accordion>
                </div>
              </Section>

              {/* Harga & Aksi */}
              <Section className="w-full flex flex-col gap-2 px-3 py-2">
                <div className="flex flex-row items-end gap-1 py-0.5">
                  <p className="text-primary text-xl font-semibold leading-none">
                    Rp {(model?.price ?? 0).toLocaleString("id-ID")}
                  </p>
                  <p className="text-default-900 text-sm leading-none">
                    per 3 hari
                  </p>
                </div>

                <div>
                  <FaInfoCircle className="inline text-default-600 mr-1" />
                  <p className="inline text-xs text-default-800">
                    Estimasi Ongkir { }
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <FaRegClock className="text-primary" />
                  <p className="text-default-800">
                    Estimasi Pengiriman 1 - 3 Hari
                  </p>
                </div>

                <Divider className="opacity-20 my-2" />

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Button
                      fullWidth
                      color="primary"
                      startContent={<BsChatFill />}
                      as={Link}
                      target="_blank"
                      href={`https://wa.me/${metadataConfig.contact.whatsapp}?text=Halo kak ${metadataConfig.name}, Mau nanya nih soal aksesoris ${model?.name}... `}
                    >
                      Hubungi Kami
                    </Button>

                    <Button
                      color="success"
                      variant="flat"
                      isIconOnly
                      onPress={handleAddToCart}
                      isLoading={addToCartMutation.isPending}
                    >
                      <FaCartShopping />
                    </Button>
                  </div>

                  <Button
                    fullWidth
                    color="primary"
                    startContent={<FaCalendar />}
                    onPress={handleDirectCheckout}
                  >
                    Sewa Sekarang
                  </Button>
                </div>

                <p className="text-[0.7rem] text-default-800 leading-[1.1]">
                  * Deposit dan ongkir akan dihitung setelah pengajuan sewa
                </p>
              </Section>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Alat Terkait */}
      <Modal size="lg" isOpen={isRelatedCostumeModalOpen} onOpenChange={onOpenChangeRelatedCostumeModal}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FaInfoCircle className="text-warning text-xl" />
                  <span>Aksesoris dengan Alat Terkait</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <p className="text-default-700">
                    Aksesoris ini harus dirental bersamaan dengan alatnya.
                    Apakah Anda ingin menambahkan alat <strong>{model?.catalog?.name}</strong> beserta aksesoris <strong>{model?.name}</strong> ke dalam keranjang?
                  </p>

                  {/* Preview Alat Terkait */}
                  {model?.catalog && (
                    <div className="flex items-center gap-4 bg-default-100 rounded-lg p-4">
                      {model.catalog.images?.[0] && (
                        <Image
                          src={model.catalog.images[0]}
                          alt={model.catalog.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover aspect-square"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-sm">{model.catalog.name}</p>
                        <p className="text-primary font-medium text-sm">
                          Rp {(model.catalog.price ?? 0).toLocaleString("id-ID")} / 3 hari
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-default-600 bg-warning-50 rounded-lg p-3 border border-warning-200">
                    <p className="flex items-start gap-2">
                      <FaInfoCircle className="text-warning mt-0.5 flex-shrink-0" />
                      <span>Dengan menyetujui, alat dan aksesoris akan ditambahkan ke keranjang Anda secara bersamaan.</span>
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={onClose}
                  isDisabled={isAddingWithCostume}
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={handleConfirmAddWithCostume}
                  isLoading={isAddingWithCostume}
                  startContent={!isAddingWithCostume && <FaCartShopping />}
                >
                  Setuju, Tambahkan Keduanya
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Konfirmasi Checkout dengan Alat Terkait */}
      <Modal size="lg" isOpen={isCheckoutModalOpen} onOpenChange={onOpenChangeCheckoutModal}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FaCalendar className="text-primary text-xl" />
                  <span>Sewa dengan Alat Terkait</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <p className="text-default-700">
                    Aksesoris ini harus disewa bersamaan dengan alatnya.
                    Apakah Anda ingin menyewa alat <strong>{model?.catalog?.name}</strong> beserta aksesoris <strong>{model?.name}</strong> sekarang?
                  </p>

                  {/* Preview Alat Terkait */}
                  {model?.catalog && (
                    <div className="flex items-center gap-4 bg-default-100 rounded-lg p-4">
                      {model.catalog.images?.[0] && (
                        <Image
                          src={model.catalog.images[0]}
                          alt={model.catalog.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover aspect-square"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-sm">{model.catalog.name}</p>
                        <p className="text-primary font-medium text-sm">
                          Rp {(model.catalog.price ?? 0).toLocaleString("id-ID")} / 3 hari
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Total Harga */}
                  <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-700">Total Sewa (3 hari):</span>
                      <span className="font-semibold text-primary text-lg">
                        Rp {((model?.catalog?.price ?? 0) + (model?.price ?? 0)).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-default-600 bg-warning-50 rounded-lg p-3 border border-warning-200">
                    <p className="flex items-start gap-2">
                      <FaInfoCircle className="text-warning mt-0.5 flex-shrink-0" />
                      <span>Dengan menyetujui, Anda akan langsung menuju halaman checkout untuk menyewa kostum dan aksesoris ini.</span>
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={onClose}
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={handleConfirmCheckoutWithCostume}
                  startContent={<FaCalendar />}
                >
                  Setuju, Sewa Sekarang
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

// ===================== MAIN PAGE COMPONENT =====================
const Page = () => {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type"); // "catalog" or "accessory"

  const [loadPage, setLoadPage] = useState(true);

  // Fetch catalog by slug
  const { data: catalogModel, isLoading: catalogLoading, isFetched: catalogFetched } = useCatalogBySlug(slug as string);

  // Fetch accessory by slug (only if catalog not found OR type is explicitly accessory)
  const shouldFetchAccessory = typeParam === "accessory" || (catalogFetched && !catalogModel);
  const { data: accessoryModel, isLoading: accessoryLoading } = useAccessoryBySlug(
    shouldFetchAccessory ? (slug as string) : undefined
  );

  // Determine which type we're displaying
  const isAccessory = typeParam === "accessory" || (catalogFetched && !catalogModel && accessoryModel);
  const model = isAccessory ? accessoryModel : catalogModel;
  const loading = isAccessory ? accessoryLoading : catalogLoading;

  const { data: allCatalogs } = useCatalog();
  const [catalogBundle, setCatalogBundle] = useState<ICatalog[]>([]);

  // Get catalog IDs for availability check
  const catalogIds = React.useMemo(() => {
    const ids: string[] = [];
    if (!isAccessory) {
      if (catalogModel?.id) ids.push(catalogModel.id);
      if (catalogBundle.length > 0) {
        catalogBundle.forEach((item: any) => {
          if (item?.id) ids.push(item.id);
        });
      }
    }
    return ids;
  }, [catalogModel?.id, catalogBundle, isAccessory]);

  // Get accessory IDs for availability check
  const accessoryIds = React.useMemo(() => {
    const ids: string[] = [];
    if (isAccessory && accessoryModel?.id) {
      ids.push(accessoryModel.id);
    }
    return ids;
  }, [isAccessory, accessoryModel?.id]);

  // Fetch booked dates for catalog items
  const { data: catalogBookedTransactions } = useBookedDatesForCatalogItems(catalogIds);

  // Fetch booked dates for accessory items
  const { data: accessoryBookedTransactions } = useBookedDatesForAccessoryItems(accessoryIds);

  // Build a list of unavailable dates from booked transactions
  const bookedDates = React.useMemo(() => {
    const transactions = isAccessory ? accessoryBookedTransactions : catalogBookedTransactions;
    if (!transactions || transactions.length === 0) return [];

    const dates: Date[] = [];
    transactions.forEach((transaction: any) => {
      const start = moment(transaction.start_rent).startOf('day');
      const end = moment(transaction.end_rent).startOf('day');

      // Add all dates in the range
      let current = start.clone();
      while (current.isSameOrBefore(end)) {
        dates.push(current.toDate());
        current.add(1, 'day');
      }
    });

    return dates;
  }, [catalogBookedTransactions, accessoryBookedTransactions, isAccessory]);

  useEffect(() => {
    setLoadPage(false);
  }, []);

  useEffect(() => {
    if (
      catalogModel?.bundle_catalog &&
      Array.isArray(catalogModel?.bundle_catalog) &&
      catalogModel.bundle_catalog.length > 0 &&
      allCatalogs
    ) {
      const catalogMap = new Map(
        allCatalogs.map((catalog: any) => [catalog.id, catalog])
      );

      const populatedBundle = catalogModel?.bundle_catalog
        .map((id: string) => catalogMap.get(id))
        .filter(Boolean);

      setCatalogBundle(populatedBundle);
    }
  }, [catalogModel, allCatalogs]);

  // Show loading state while determining content type
  const isLoading = catalogLoading || (shouldFetchAccessory && accessoryLoading);

  // Show 404 if nothing found
  if (!isLoading && catalogFetched && !model) {
    return (
      <div className="py-4 align-middle flex items-center justify-center h-screen">
        <div className="flex text-center flex-col">
          <Image
            src="/anya.png"
            alt="404"
            width={200}
            height={200}
            className="self-center"
          />
          <h1 className="text-xl font-semibold">Item gak ketemu 😱</h1>
          <p className="text-default-600">
            Mungkin udah dihapus atau emang gak ada
          </p>
        </div>
      </div>
    );
  }

  // Render appropriate detail component
  if (isAccessory) {
    return (
      <AccessoryDetail
        model={model}
        loading={loading}
        loadPage={loadPage}
        bookedDates={bookedDates}
      />
    );
  }

  return (
    <CatalogDetail
      model={model}
      loading={loading}
      loadPage={loadPage}
      catalogBundle={catalogBundle}
      bookedDates={bookedDates}
    />
  );
};

export default Page;
