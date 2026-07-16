"use client";

import { useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { UserCatalogCard } from "@/components/ui/Card/Catalog";
import { WishlistCard } from "@/components/ui/Card/Wishlist";
import { FaHeart, FaPlus } from "react-icons/fa6";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  SelectItem,
  useDisclosure,
  ScrollShadow,
  Card,
  CardBody,
  Skeleton,
} from "@heroui/react";
import { Button, Input, Pagination, Select, DatePicker } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import { FaSearch, FaCheck } from "react-icons/fa";
import { usePagination } from "@/hooks/pagination";
import { presetPagination } from "@/lib/types/pagination";
import {
  usePaginatedWishlist,
  useCreateOrUpdateWishlist,
} from "@/hooks/react-query/wishlist";
import { useCatalog } from "@/hooks/react-query/catalog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wishlistSchema, IWishlist } from "@/lib/types/schemas/wishlist";
import { parseDate, today, getLocalTimeZone } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { metadataConfig } from "@/app/config";
import Image from "next/image";

const defaultWishlist = {
  wishlist_name: "",
  date: "",
  catalog_ids: [],
};

const WishlistPage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { user } = useSession();

  const {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    pageSize,
    setPageSize,
    debouncedSearch,
  } = usePagination();

  const { data: wishlistData, isLoading: loading } = usePaginatedWishlist({
    page,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    userId: user?.id,
    enabled: !!user?.id,
  });

  const { data: catalogs, isLoading: loadingCatalogs } = useCatalog();

  const wishlistMutation = useCreateOrUpdateWishlist();

  const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>([]);
  const [mode, setMode] = useState<"create" | "update">("create");
  const [editingWishlist, setEditingWishlist] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<IWishlist>({
    resolver: zodResolver(wishlistSchema),
    defaultValues: defaultWishlist,
  });

  const onSubmit = async (data: IWishlist) => {
    if (selectedCatalogIds.length === 0) {
      return; // Prevent submission if no catalogs selected
    }

    try {
      await wishlistMutation.mutateAsync({
        id: mode === "update" ? editingWishlist?.id : undefined,
        wishlist_name: data.wishlist_name,
        date: data.date,
        catalog_ids: selectedCatalogIds,
      });
      reset(defaultWishlist);
      setSelectedCatalogIds([]);
      setMode("create");
      setEditingWishlist(null);
      onOpenChange();
    } catch (error) {
      console.error("Failed to save wishlist:", error);
    }
  };

  const handleClose = () => {
    reset(defaultWishlist);
    setSelectedCatalogIds([]);
    setMode("create");
    setEditingWishlist(null);
    onOpenChange();
  };

  const openCreateModal = () => {
    setMode("create");
    setEditingWishlist(null);
    reset(defaultWishlist);
    setSelectedCatalogIds([]);
    onOpen();
  };

  const openEditModal = (wishlist: any) => {
    setMode("update");
    setEditingWishlist(wishlist);
    reset({
      wishlist_name: wishlist.wishlist_name,
      date: wishlist.date,
    });
    // Set selected catalog IDs from existing items - use catalog.id
    const catalogIds = wishlist.wishlist_items?.map((item: any) => item.catalog?.id) || [];
    setSelectedCatalogIds(catalogIds);
    onOpen();
  };

  return (
    <>
      <Section className="flex flex-col gap-4 px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <FaHeart className="text-primary" size={20} />
          <h2 className="text-xl font-semibold">Wishlist</h2>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between items-center flex-wrap gap-4">
            <div className="flex flex-col items-start gap-2 w-full sm:w-auto">
              <div className="flex flex-row items-center gap-2 w-full">
                <Input
                  type="text"
                  placeholder="Cari..."
                  startContent={<FaSearch />}
                  value={searchTerm}
                  onValueChange={(e) => setSearchTerm(e)}
                  className="w-full sm:w-48 md:w-64"
                />
                <Button
                  onPress={openCreateModal}
                  color="primary"
                  startContent={<FaPlus />}
                >
                  Tambah
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Tampilkan</span>
                <Select
                  disallowEmptySelection
                  variant="bordered"
                  classNames={{ trigger: "bg-default-50" }}
                  className="w-20"
                  selectedKeys={[pageSize.toString()]}
                  onSelectionChange={(keys) => {
                    const size = Number(Array.from(keys)[0]);
                    setPageSize(size);
                  }}
                  items={presetPagination}
                >
                  {(item: any) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  )}
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 w-h-full gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="aspect-[3/4] rounded-lg" />
                ))
              ) : wishlistData?.data.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-4">
                    <FaHeart className="text-default-300" size={28} />
                  </div>
                  <p className="text-default-600 font-medium mb-1">Belum ada wishlist</p>
                  <p className="text-sm text-default-400 mb-4">
                    Simpan alat & perlengkapan outdoor favoritmu di sini
                  </p>
                </div>
              ) : (
                wishlistData?.data.map((item: any, idx: number) => (
                  <WishlistCard key={idx} wishlist={item} onEdit={openEditModal} />
                ))
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            {wishlistData?.pagination &&
              wishlistData.pagination.totalPages > 1 && (
                <Pagination
                  loop
                  showControls
                  initialPage={1}
                  page={page}
                  total={wishlistData.pagination.totalPages}
                  onChange={setPage}
                />
              )}
          </div>
        </div>
      </Section>

      {/* Modal Form */}
      <Modal isOpen={isOpen} onOpenChange={handleClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>
                {mode === "create" ? "Buat Wishlist Baru" : "Edit Wishlist"}
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <Input
                  label="Nama Wishlist"
                  type="text"
                  color="primary"
                  {...register("wishlist_name")}
                  isInvalid={!!errors.wishlist_name}
                  errorMessage={errors.wishlist_name?.message}
                />

                {/* Catalog Image Scroll */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Pilih Catalog</label>
                  <ScrollShadow
                    orientation="horizontal"
                    className="flex gap-3 pb-2"
                  >
                    {loadingCatalogs ? (
                      <>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Skeleton
                            key={idx}
                            className="min-w-[120px] w-[120px] h-[150px] rounded-lg"
                          />
                        ))}
                      </>
                    ) : (
                      (catalogs || []).map((catalog: any) => {
                        const isSelected = selectedCatalogIds.includes(catalog.id);
                        return (
                          <Card
                            key={catalog.id}
                            isPressable
                            className={`min-w-[120px] w-[120px] cursor-pointer transition-all ${
                              isSelected
                                ? "ring-2 ring-primary ring-offset-2"
                                : "hover:scale-105"
                            }`}
                            onPress={() => {
                              setSelectedCatalogIds(prev =>
                                isSelected
                                  ? prev.filter(id => id !== catalog.id)
                                  : [...prev, catalog.id]
                              );
                            }}
                          >
                            <CardBody className="p-0 overflow-hidden">
                              <div className="relative w-full h-[100px]">
                                <Image
                                  src={
                                    catalog.images?.[0] || "/placeholder.jpeg"
                                  }
                                  alt={catalog.name}
                                  fill
                                  className="object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                    <div className="bg-primary rounded-full p-1">
                                      <FaCheck className="text-white text-sm" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="p-2">
                                <p className="text-xs font-medium truncate">
                                  {catalog.name}
                                </p>
                              </div>
                            </CardBody>
                          </Card>
                        );
                      })
                    )}
                  </ScrollShadow>
                  {selectedCatalogIds.length === 0 && (
                    <p className="text-danger text-xs">
                      Pilih minimal 1 katalog
                    </p>
                  )}
                </div>

                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <I18nProvider locale={metadataConfig.locale}>
                      <DatePicker
                        label="Tanggal Event"
                        color="primary"
                        value={
                          field.value && typeof field.value === "string"
                            ? parseDate(field.value.split("T")[0])
                            : null
                        }
                        onChange={(date) => field.onChange(date?.toString())}
                        minValue={today(getLocalTimeZone())}
                        isInvalid={!!errors.date}
                        errorMessage={errors.date?.message}
                      />
                    </I18nProvider>
                  )}
                />
              </ModalBody>
              <ModalFooter>
                <Button type="button" onPress={onClose}>
                  Tutup
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={wishlistMutation.isPending}
                >
                  {mode === "create" ? "Buat" : "Update"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default WishlistPage;
