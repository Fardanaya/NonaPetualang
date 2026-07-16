"use client";

import AddonCard from "@/components/ui/Card/AddOn";
import SkeletonAddonCard from "@/components/ui/Card/AddOn/Skeleton";
import Image from "next/image";
import {
  Button,
  Input,
  Modal,
  NumberInput,
  Pagination,
  Select,
} from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import TableTitle from "@/components/ui/Table/Title";
import { presetPagination } from "@/lib/types/pagination";
import { usePagination } from "@/hooks/pagination";
import {
  ButtonGroup,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa6";
import { LuImagePlus, LuImageUp } from "react-icons/lu";
import {
  displayToast,
  flattenIdProperties,
  validateFileSize,
} from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultAddOn, IAddOn, addOnSchema } from "@/lib/types/schemas/add-on";
import { z } from "zod";

import {
  usePaginatedAddons,
  useCreateOrUpdateAddons,
  useDeleteAddon,
} from "@/hooks/react-query/addon";
import { InputError } from "@/components/ui/Input";

const Page = () => {
  const [selectedFile, setSelectedFile] = useState<File | string | null>(null);
  const [action, setAction] = useState("add");
  const [oldStock, setOldStock] = useState(0);
  const [stockInputValue, setStockInputValue] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    pageSize,
    setPageSize,
    debouncedSearch,
  } = usePagination();

  // Use the paginated addons hook
  const { data: addonsData, isLoading } = usePaginatedAddons({
    page,
    pageSize,
    searchTerm: debouncedSearch || undefined,
  });

  // Use the mutation hooks
  const createOrUpdateMutation = useCreateOrUpdateAddons();
  const deleteMutation = useDeleteAddon();

  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<IAddOn>({
    resolver: zodResolver(addOnSchema),
    defaultValues: defaultAddOn,
  });

  const formValues = watch();

  const handleImageUpload = async (file: File, id?: string) => {
    if (!validateFileSize(file, 2)) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("type", "addons");
      formData.append("id", id || formValues?.id || "");

      const uploadResponse = await fetch("/api/tools/image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Image upload failed");
      }

      if (uploadData.success) {
        return uploadData.results[0].url;
      }
    } catch (error) {
      console.error("Upload error:", error);
      displayToast({
        type: "danger",
        title: "Error",
        description: "Failed to upload image",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (url: string) => {
    try {
      const publicId = url.split("/").pop()?.split(".")[0];
      if (!publicId) return;

      const response = await fetch("/api/tools/image", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId,
          type: "addons",
          id: formValues?.id || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.statusText}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error("Image deletion timed out");
        } else {
          console.error("Error deleting image:", error.message);
        }
      } else {
        console.error("Unknown error occurred during image deletion");
      }
    }
  };

  const onSubmit = async (data: IAddOn) => {
    try {
      let imageUrl = data.image;

      // For new addons (no ID), create the addon first to get an ID
      if (!formValues.id && selectedFile && typeof selectedFile !== "string") {
        // Create addon without image first
        const addonData = {
          ...data,
          image: "", // Empty image initially
        };

        const createdAddon = await createOrUpdateMutation.mutateAsync(
          addonData
        );

        // Now upload image with the generated ID
        imageUrl = await handleImageUpload(selectedFile, createdAddon.id);

        // Update the addon with the image URL
        const updatedData = {
          ...createdAddon,
          image: imageUrl,
        };

        await createOrUpdateMutation.mutateAsync(updatedData);
      }
      // For existing addons (with ID), handle image upload/update
      else if (
        formValues.id &&
        selectedFile &&
        typeof selectedFile !== "string"
      ) {
        // Upload new image
        imageUrl = await handleImageUpload(selectedFile, formValues.id);

        // If there was a previous image, delete the old one
        if (formValues.image && formValues.image !== imageUrl) {
          await handleImageDelete(formValues.image);
        }

        // Update the addon with the new image URL
        const submitData = {
          ...data,
          image: imageUrl,
        };

        await createOrUpdateMutation.mutateAsync(submitData);
      }
      // For updates without image change
      else {
        await createOrUpdateMutation.mutateAsync(data);
      }

      setSelectedFile(null);
      handleClose();
    } catch (error) {
      console.error("Failed to create/update addon:", error);
      displayToast({
        type: "danger",
        title: "Error",
        description: "Failed to create/update addon",
      });
    }
  };

  const onRemove = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      handleClose();
    } catch (error) {
      console.error("Failed to remove addon:", error);
      displayToast({
        type: "danger",
        title: "Error",
        description: "Failed to remove addon",
      });
    }
  };

  const handleClose = () => {
    reset(defaultAddOn);
    setSelectedFile(null);
    setAction("add");
    setOldStock(0);
    setStockInputValue(0);
    onOpenChange();
  };

  return (
    <div className="flex flex-col gap-4">
      <Section className="px-4 py-3 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
          <TableTitle
            title="Add-on"
            description="Kelola item tambahan penunjang aktivitas outdoor customer"
          />
          <div className="flex flex-row items-center gap-2">
            <Input
              isClearable
              type="text"
              placeholder="Search"
              startContent={<FaSearch className="text-primary" />}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <Button
              onPress={() => {
                reset();
                onOpen();
              }}
              color="primary"
              startContent={<FaPlus />}
            >
              Add
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between items-center">
            <p className="text-xs">
              Total&nbsp;
              <span className="font-semibold">
                {addonsData?.pagination?.totalRecords || 0}
              </span>
              &nbsp;Add On
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs">Showing</span>
              <Select
                disallowEmptySelection
                size={"xs" as any}
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
          {!isLoading && addonsData?.data?.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[150px]">
              <p>Tidak ada data yang dapat ditampilkan</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
            {isLoading
              ? Array.from({ length: pageSize }).map((_, idx) => (
                  <SkeletonAddonCard key={idx} />
                ))
              : addonsData?.data?.map((item: any, idx: number) => (
                  <AddonCard
                    key={idx}
                    item={item}
                    onPress={() => {
                      reset(flattenIdProperties(item));
                      setSelectedFile(item.image);
                      setOldStock(item.stock);
                      setAction("add");
                      onOpen();
                    }}
                  />
                ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          {addonsData?.pagination && addonsData.pagination.totalPages > 1 && (
            <Pagination
              loop
              showControls
              initialPage={1}
              page={page}
              total={addonsData.pagination.totalPages}
              onChange={setPage}
            />
          )}
        </div>
      </Section>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-h-[80vh] overflow-y-auto"
            >
              <ModalHeader>
                {formValues.id ? "Update" : "Create"} Add On
              </ModalHeader>
              <ModalBody className="flex flex-col items-center gap-4">
                {selectedFile ? (
                  <div className="relative w-full md:w-[250px] aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={
                        typeof selectedFile === "string"
                          ? selectedFile
                          : URL.createObjectURL(selectedFile)
                      }
                      alt={formValues.name || "Add On"}
                      fill
                      className="object-cover z-0"
                    />
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      isIconOnly
                      className="absolute top-2 right-2 z-10"
                      onPress={() => setSelectedFile(null)}
                    >
                      <FaTrash className="text-danger" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative flex justify-center items-center w-full md:w-[250px] aspect-square rounded-lg bg-default-200 hover:bg-primary/10 transition border-dashed border-2 border-primary overflow-hidden">
                    <div className="absolute flex flex-col justify-center items-center gap-2 w-full h-full top-0 left-0 z-10 pointer-events-none">
                      {uploading ? (
                        <div className="flex flex-col justify-center items-center gap-2 w-1/2">
                          <LuImageUp className="text-primary" size={43} />
                          <Progress
                            color="primary"
                            radius="sm"
                            size="sm"
                            isIndeterminate
                          />
                        </div>
                      ) : (
                        <LuImagePlus className="text-primary" size={43} />
                      )}
                    </div>

                    <input
                      type="file"
                      name="images"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          e.target.value = "";
                        }
                      }}
                      className={`h-full w-full opacity-0 cursor-pointer z-20 ${
                        uploading ? "cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2 w-full">
                  <Input
                    label="Nama Barang"
                    type="text"
                    color="primary"
                    {...register("name")}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                    className="col-span-2"
                  />
                  <NumberInput
                    hideStepper
                    label="Harga"
                    variant="bordered"
                    color="primary"
                    value={formValues.price ?? 0}
                    isInvalid={!!errors.price}
                    errorMessage={errors.price?.message}
                    onValueChange={(value) => {
                      setValue("price", value);
                    }}
                    startContent={
                      <span className="text-default-600 text-xs font-medium">
                        Rp
                      </span>
                    }
                  />

                  <div className="flex flex-col gap-2 pt-4">
                    <label className="text-sm text-foreground-500">
                      Jumlah
                    </label>
                    <div className="flex flex-row items-center gap-2">
                      <ButtonGroup variant="flat" color="primary" radius="sm">
                        <Button
                          onPress={() => {
                            setAction("add");
                            const newStock = oldStock + stockInputValue;
                            setValue("stock", newStock);
                            clearErrors("stock");
                          }}
                          variant={action === "add" ? "solid" : "flat"}
                          startContent={<FaPlus />}
                        >
                          Tambah
                        </Button>
                        <Button
                          onPress={() => {
                            setAction("remove");
                            const newStock = oldStock - stockInputValue;
                            setValue("stock", newStock);
                            clearErrors("stock");
                          }}
                          variant={action === "remove" ? "solid" : "flat"}
                          startContent={<FaMinus />}
                          isDisabled={!formValues.id}
                        >
                          Kurangi
                        </Button>
                      </ButtonGroup>
                      <NumberInput
                        hideStepper
                        label=" "
                        aria-label="Stock"
                        variant="bordered"
                        color="primary"
                        classNames={{
                          base: "mt-0!",
                        }}
                        value={stockInputValue}
                        onValueChange={(value) => {
                          setStockInputValue(value);
                          const newStock =
                            action === "add"
                              ? oldStock + value
                              : oldStock - value;
                          setValue("stock", newStock);
                          clearErrors("stock");
                        }}
                        isInvalid={!!errors.stock}
                        endContent={
                          <span className="text-default-600 text-xs font-medium">
                            ITEM
                          </span>
                        }
                      />
                    </div>
                    <div>
                      {errors?.stock?.message && (
                        <InputError
                          message={errors?.stock?.message as string}
                          className="col-span-2"
                        />
                      )}
                    </div>

                    <div className="flex flex-col justify-center items-center bg-default-200 px-3 py-2 rounded-lg">
                      <p className="font-semibold text-primary">{oldStock}</p>
                      <p className="text-xs uppercase">Jumlah Sekarang</p>
                    </div>
                    {stockInputValue > 0 && (
                      <div className="flex flex-col justify-center items-center bg-default-200 px-3 py-2 rounded-lg">
                        <p className="font-semibold text-primary">
                          {formValues.stock ?? 0}
                        </p>
                        <p className="text-xs uppercase">Jumlah Baru</p>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="flex justify-between">
                <div>
                  {formValues.id && (
                    <Button onPress={() => onRemove(formValues.id as string)}>
                      Delete
                    </Button>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button type="button" onPress={onClose}>
                    {formValues.id ? "Cancel" : "Close"}
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    isLoading={isLoading || uploading}
                  >
                    {formValues.id ? "Update" : "Create"}
                  </Button>
                </div>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Page;
