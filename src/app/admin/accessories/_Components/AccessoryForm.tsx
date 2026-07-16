"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDisclosure } from "@heroui/react";

import { useAllCatalogs, useCatalogById } from "@/hooks/react-query/catalog";
import { useAccessoryById } from "@/hooks/react-query/accessories";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  accessorySchema,
  createDefaultAccessory,
} from "@/lib/types/schemas/accessory";
import { accessoryTypes } from "@/lib/constant/accessory";
import {
  Input,
  Button,
  NumberInput,
  Autocomplete,
  Select,
} from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import { InputLabel } from "@/components/ui/Input";
import { AutocompleteItem, Progress, SelectItem } from "@heroui/react";
import Image from "next/image";
import { FaTrash } from "react-icons/fa6";
import TextEditor from "@/components/ui/TextEditor";
import { LuImagePlus, LuImageUp, LuImages, LuClipboardCheck, LuBox } from "react-icons/lu";
import { CgDetailsMore } from "react-icons/cg";
import { displayToast, validateFileSize, validateImageType } from "@/lib/utils";
import { createOrUpdateAccessory } from "@/lib/actions/accessory";
import { useCreateOrUpdateAccessory, useDeleteAccessory } from "@/hooks/react-query/accessories";

interface AccessoryFormProps {
  mode: "create" | "edit";
  accessoryId?: string;
}

const AccessoryForm = ({ mode, accessoryId }: AccessoryFormProps) => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [uploading, setUploading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesMarkedForDeletion, setImagesMarkedForDeletion] = useState<
    Set<string>
  >(new Set());
  const [previewImages, setPreviewImages] = useState<
    { url: string; file: File; uploading?: boolean; progress?: number }[]
  >([]);

  // Use React Query hooks
  const { data: catalogs = [] } = useAllCatalogs();
  const { data: accessoryData, isLoading: accessoryLoading } = useAccessoryById(
    mode === "edit" ? accessoryId : undefined
  );

  // Use mutation hooks
  const createOrUpdateMutation = useCreateOrUpdateAccessory();
  const deleteMutation = useDeleteAccessory();

  // React Hook Form with Zod validation
  const {
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    getValues,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accessorySchema),
    defaultValues: createDefaultAccessory(),
  });

  // Populate form with accessory data when in edit mode
  useEffect(() => {
    if (mode === "edit" && accessoryData && !accessoryLoading) {
      console.log("Accessory data:", accessoryData);
      reset(accessoryData);
      setExistingImages(accessoryData.images || []);
    }
  }, [accessoryData, accessoryLoading, mode]);

  const handleImageUploadWithProgress = async (
    file: File,
    id: string,
    index: number
  ): Promise<string | null> => {
    if (!validateImageType(file)) return null;
    if (!validateFileSize(file, 2)) return null;

    try {
      // Set uploading state for this image
      setPreviewImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, uploading: true, progress: 0 } : img
        )
      );

      const formData = new FormData();
      formData.append("files", file);
      formData.append("type", "accessory");
      formData.append("id", id);

      // Use XMLHttpRequest to track upload progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setPreviewImages((prev) =>
              prev.map((img, i) => (i === index ? { ...img, progress } : img))
            );
          }
        });

        xhr.addEventListener("load", () => {
          try {
            const uploadData = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              if (uploadData.success) {
                resolve(uploadData.results[0].url);
              } else {
                reject(new Error(uploadData.error || "Image upload failed"));
              }
            } else {
              reject(new Error(uploadData.error || "Image upload failed"));
            }
          } catch (error) {
            reject(new Error("Failed to parse upload response"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Image upload failed"));
        });

        xhr.open("POST", "/api/tools/image");
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Upload error:", error);
      displayToast({
        type: "danger",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Image upload failed",
      });
      return null;
    }
  };

  const handleExistingImageDelete = async (url: string) => {
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
          type: "accessory",
          id: getValues()?.id || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.statusText}`);
      } else {
        setExistingImages((prev) => prev.filter((img) => img !== url));
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

  const handlePreviewImageDelete = (index: number) => {
    const previewImage = previewImages[index];
    if (previewImage) {
      URL.revokeObjectURL(previewImage.url);
      setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      console.log("Submitting form data:", formData);

      // Submit with existing images, excluding those marked for deletion
      const filteredImages = existingImages.filter(
        (img) => !imagesMarkedForDeletion.has(img)
      );
      const dataToSubmit = {
        ...formData,
        images: filteredImages,
      };

      // Create/update the accessory using mutation
      const result = await createOrUpdateMutation.mutateAsync(dataToSubmit);

      console.log("Accessory created/updated:", result);

      // Upload preview images with progress tracking
      if (previewImages.length > 0) {
        console.log("Uploading images for accessory...");
        displayToast({
          type: "warning",
          title: "Uploading images",
          description: `Uploading ${previewImages.length} image${
            previewImages.length > 1 ? "s" : ""
          }...`,
        });
        const uploadPromises = previewImages.map((preview, index) =>
          handleImageUploadWithProgress(preview.file, result.id, index)
        );

        // Wait for all uploads to complete
        const uploadedResults = await Promise.allSettled(uploadPromises);

        const uploadedImageUrls: string[] = [];
        let failedCount = 0;

        uploadedResults.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value) {
            uploadedImageUrls.push(result.value);
          } else {
            console.error(
              `Failed to upload image ${index + 1}:`,
              (result as PromiseRejectedResult).reason
            );
            failedCount++;
          }
        });

        if (failedCount > 0) {
          displayToast({
            type: "danger",
            title: "Error",
            description: `Failed to upload ${failedCount} image${
              failedCount > 1 ? "s" : ""
            }.`,
          });
        } else if (uploadedImageUrls.length > 0) {
          displayToast({
            type: "success",
            title: "Success",
            description: `Successfully uploaded ${
              uploadedImageUrls.length
            } image${uploadedImageUrls.length > 1 ? "s" : ""}!`,
          });
        }
        // Update the accessory with all images (existing + new)
        if (uploadedImageUrls.length > 0) {
          const updatedImages = [...existingImages, ...uploadedImageUrls];

          // Update local state immediately for instant UI feedback
          setExistingImages(updatedImages);

          const updatedAccessory = await createOrUpdateAccessory({
            ...dataToSubmit,
            id: result.id,
            images: updatedImages,
          });

          console.log("Accessory updated with images:", updatedAccessory);
        }
      }

      // Clear preview images and cleanup blob URLs after successful submission
      previewImages.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
      setPreviewImages([]);

      // Update form with new ID for future edits (only for new accessories)
      if (mode === "create") {
        setValue("id", result.id);
      }

      // Redirect to accessories list
      router.push("/admin/accessories");
    } catch (error) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} Accessory:`,
        error
      );
      displayToast({
        type: "danger",
        title: "Error",
        description: `Failed to ${
          mode === "create" ? "create" : "update"
        } accessory`,
      });
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-5 space-y-4 md:space-x-4"
    >
      
      <div className="col-span-3 flex flex-col gap-4">
        <Section className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CgDetailsMore />
            <h3 className="font-semibold">General Information</h3>
          </div>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                label="Accessory Name"
                placeholder="Enter accessory name"
                variant="bordered"
                value={field.value}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
                onValueChange={field.onChange}
              />
            )}
          />
          <div className="flex flex-col gap-1">
            <p className="text-sm text-primary">Description</p>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextEditor
                  height={300}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            {errors.description && (
              <p className="text-danger text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-primary">Important Information</p>
            <Controller
              name="important_info"
              control={control}
              render={({ field }) => (
                <TextEditor
                  height={300}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            {errors.important_info && (
              <p className="text-danger text-sm">
                {errors.important_info.message}
              </p>
            )}
          </div>
        </Section>

        <Section className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <LuImages />
            <h3 className="font-semibold">Accessory Media</h3>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-primary">Image</p>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-2">
                {existingImages?.map((img: string, index: number) => {
                  const isMarkedForDeletion =
                    imagesMarkedForDeletion.has(img);
                  return (
                    <div
                      key={index}
                      className="relative aspect-square size-60"
                    >
                      <Image
                        src={img}
                        alt={`Existing ${index}`}
                        fill
                        className={`object-cover rounded-md ${
                          isMarkedForDeletion ? "opacity-50" : ""
                        }`}
                      />
                      {!isMarkedForDeletion ? (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="faded"
                          onPress={() => {
                            setImagesMarkedForDeletion(
                              (prev) => new Set([...prev, img])
                            );
                          }}
                          className="absolute top-1 right-1"
                        >
                          <FaTrash className="text-primary" />
                        </Button>
                      ) : (
                        <div className="absolute top-1 right-1 flex gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => {
                              handleExistingImageDelete(img);
                            }}
                          >
                            Delete Now
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            color="secondary"
                            variant="flat"
                            onPress={() => {
                              setImagesMarkedForDeletion((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(img);
                                return newSet;
                              });
                            }}
                          >
                            Undo
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {previewImages?.map((preview, index: number) => (
                  <div
                    key={`preview-${index}`}
                    className="relative aspect-square size-60"
                  >
                    <Image
                      src={preview.url}
                      alt={`Preview ${index}`}
                      fill
                      className="object-cover rounded-md"
                    />
                    {!preview.uploading && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="faded"
                        onPress={() => {
                          handlePreviewImageDelete(index);
                        }}
                        className="absolute top-1 right-1"
                      >
                        <FaTrash className="text-primary" />
                      </Button>
                    )}
                    {preview.uploading && preview.progress !== undefined && (
                      <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 w-full px-4">
                          <Progress
                            color="primary"
                            size="sm"
                            value={preview.progress}
                            className="w-full"
                          />
                          <p className="text-xs text-white font-semibold">
                            {Math.round(preview.progress)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="relative flex justify-center items-center size-60 rounded-lg bg-default-200 hover:bg-primary/10 transition border-dashed border-2 border-primary">
                  <div className="absolute flex flex-col justify-center items-center gap-2 w-full h-full top-0 left-0">
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
                      if (
                        file &&
                        validateImageType(file) &&
                        validateFileSize(file, 2)
                      ) {
                        // Create preview URL immediately
                        const previewUrl = URL.createObjectURL(file);

                        setPreviewImages((prev) => [
                          ...prev,
                          {
                            url: previewUrl,
                            file,
                          },
                        ]);

                        e.target.value = "";

                        displayToast({
                          type: "success",
                          title: "Image added",
                          description:
                            "Image will be uploaded when you save the accessory.",
                        });
                      }
                    }}
                    className={`h-full w-full opacity-0 cursor-pointer ${
                      uploading ? "cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>
              {errors.images && (
                <p className="text-danger text-xs">{errors.images.message}</p>
              )}
            </div>
          </div>
        </Section>
      </div>

      <div className="col-span-2 flex flex-col gap-4">
        <Section className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <LuClipboardCheck />
            <h3 className="font-semibold">Details</h3>
          </div>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Type"
                variant="bordered"
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  field.onChange(selected);
                }}
                isInvalid={!!errors.type}
                errorMessage={errors.type?.message}
              >
                {accessoryTypes.map((type) => (
                  <SelectItem key={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="catalog_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                label="Linked Catalog"
                variant="bordered"
                color="primary"
                selectedKey={field.value || ""}
                onSelectionChange={field.onChange}
              >
                {catalogs?.map((catalog: any) => (
                  <AutocompleteItem key={catalog.id}>
                    {catalog.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          />
        </Section>

        <Section className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <LuBox />
            <h3 className="font-semibold">Packaging</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Controller
              name="weight"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={"Weight"}
                  hideStepper
                  variant="bordered"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  endContent={<p className="text-xs opacity-50">kg</p>}
                />
              )}
            />
            <Controller
              name="length"
              control={control}
              render={({ field }) => (
                <NumberInput
                  hideStepper
                  label={"Length"}
                  variant="bordered"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  endContent={<p className="text-xs opacity-50">cm</p>}
                />
              )}
            />
            <Controller
              name="height"
              control={control}
              render={({ field }) => (
                <NumberInput
                  hideStepper
                  label={"Height"}
                  variant="bordered"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  endContent={<p className="text-xs opacity-50">cm</p>}
                />
              )}
            />
            <Controller
              name="width"
              control={control}
              render={({ field }) => (
                <NumberInput
                  hideStepper
                  label={"Width"}
                  variant="bordered"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  endContent={<p className="text-xs opacity-50">cm</p>}
                />
              )}
            />
          </div>
        </Section>

        <Section className="px-4 py-3 flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <div className="w-full md:w-[30%]">
                <InputLabel label="Price" desc="Rent price" />
              </div>
              <div className="w-full md:w-[70%]">
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      hideStepper
                      variant="bordered"
                      value={field.value}
                      isInvalid={!!errors.price}
                      errorMessage={errors.price?.message}
                      onValueChange={(value) => field.onChange(Number(value))}
                      endContent={
                        <span className="text-gray-500 text-xs w-[100px]">
                          / 3 Day
                        </span>
                      }
                      formatOptions={{
                        style: "currency",
                        currency: "IDR",
                        currencyDisplay: "narrowSymbol",
                        currencySign: "accounting",
                      }}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <div className="w-full md:w-[30%]">
                <InputLabel label="Additional Day Price" desc="Extra price per additional day" />
              </div>
              <div className="w-full md:w-[70%]">
                <Controller
                  name="additional_day_price"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      hideStepper
                      variant="bordered"
                      value={field.value}
                      isInvalid={!!errors.additional_day_price}
                      errorMessage={errors.additional_day_price?.message}
                      onValueChange={(value) => field.onChange(Number(value))}
                      min={0}
                      endContent={
                        <span className="text-gray-500 text-xs w-[100px]">
                          / Day
                        </span>
                      }
                      formatOptions={{
                        style: "currency",
                        currency: "IDR",
                        currencyDisplay: "narrowSymbol",
                        currencySign: "accounting",
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <div>
              <Button
                color="danger"
                onPress={() => {
                  const accessoriesId = getValues()?.id;
                  if (accessoriesId) {
                    deleteMutation.mutate(accessoriesId);
                  }
                }}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onPress={async () => {
                  // Cleanup blob URLs from preview images
                  previewImages.forEach((preview) => {
                    URL.revokeObjectURL(preview.url);
                  });
                  setPreviewImages([]);
                  router.push("/admin/accessories");
                }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isSubmitting || createOrUpdateMutation.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </form>
  );
};

export default AccessoryForm;
