"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Button,
  Input,
  Modal,
  Autocomplete,
} from "@/components/ui/heroui";
import { InputLabel } from "@/components/ui/Input";
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  AutocompleteItem,
} from "@heroui/react";
import {
  useCreateOrUpdateAddress,
  useDeleteAddress,
} from "@/hooks/react-query/address";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addressSchema,
  defaultAddress,
  IAddress,
} from "@/lib/types/schemas/address";
import { displayToast } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import { fetchAddressSuggestions } from "@/lib/fetch";
import AddressCard from "@/components/ui/Card/Address";
import SkeletonAddressCard from "@/components/ui/Card/Address/Skeleton";
import { LuMapPin, LuPlus } from "react-icons/lu";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

interface AddressStepProps {
  userId?: string;
  addresses: IAddress[];
  isLoading: boolean;
}

const AddressStep = ({ userId, addresses, isLoading }: AddressStepProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [newAddress, setNewAddress] = useState({
    lat: "",
    lng: "",
    address: "",
  });

  const createOrUpdateMutation = useCreateOrUpdateAddress();
  const deleteMutation = useDeleteAddress();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IAddress>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultAddress,
  });

  const [debouncedSearch] = useDebounce(async (query: string) => {
    if (query.length < 4) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const data = await fetchAddressSuggestions(query);
      if (data.data?.locations) {
        setSuggestions(data.data.locations);
      }
    } catch (error) {
      console.error("Error searching locations:", error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, 2000);

  const formValues = watch();

  const handleClose = () => {
    reset(defaultAddress);
    setSuggestions([]);
    onOpenChange();
  };

  const onSubmit = async (formData: IAddress) => {
    const dataToSubmit = { ...formData, user_id: userId };
    if (!dataToSubmit.id) {
      delete dataToSubmit.id;
    }
    try {
      await createOrUpdateMutation.mutateAsync(dataToSubmit);
      displayToast({
        type: "success",
        title: "Berhasil",
        description: "Alamat berhasil disimpan",
      });
      handleClose();
    } catch (error) {
      console.error("Failed to create/update address:", error);
      displayToast({
        type: "danger",
        title: "Error",
        description: "Gagal menyimpan alamat",
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/ui/Map"), {
        loading: () => (
          <div className="h-48 bg-default-100 rounded-lg flex items-center justify-center">
            <p className="text-default-500">Loading map...</p>
          </div>
        ),
        ssr: false,
      }),
    []
  );

  const hasAddress = addresses && addresses.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold">2</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Alamat</h2>
          <p className="text-sm text-default-500">
            Tambahkan minimal 1 alamat pengiriman
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className={`flex items-center gap-2 p-3 rounded-lg ${
          hasAddress
            ? "bg-success/10 text-success"
            : "bg-warning/10 text-warning"
        }`}
      >
        {hasAddress ? (
          <>
            <FaCheckCircle />
            <span className="text-sm font-medium">
              Anda memiliki {addresses.length} alamat tersimpan
            </span>
          </>
        ) : (
          <>
            <FaExclamationCircle />
            <span className="text-sm font-medium">
              Belum ada alamat. Tambahkan minimal 1 alamat untuk melanjutkan.
            </span>
          </>
        )}
      </div>

      {/* Address List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <SkeletonAddressCard />
        ) : (
          <>
            {addresses?.map((item: IAddress) => (
              <AddressCard
                key={item.id}
                data={item}
                onUpdate={(data) => {
                  reset(data);
                  onOpen();
                }}
                onDelete={handleDelete}
              />
            ))}
          </>
        )}

        {/* Add Address Button */}
        <Button
          fullWidth
          color="primary"
          variant={hasAddress ? "bordered" : "solid"}
          startContent={<LuPlus />}
          onPress={() => {
            onOpen();
            reset(defaultAddress);
          }}
          className="font-medium"
        >
          Tambah Alamat {!hasAddress && "(Wajib)"}
        </Button>
      </div>

      {/* Add/Edit Address Modal */}
      <Modal isOpen={isOpen} onOpenChange={handleClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>
                {formValues.id ? "Edit Alamat" : "Tambah Alamat Baru"}
              </ModalHeader>
              <ModalBody className="overflow-y-auto max-h-[60vh]">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="hidden" {...register("id")} />

                    <Input
                      type="text"
                      label="Label"
                      placeholder="Contoh: Rumah, Kantor, Kos"
                      {...register("label")}
                      errorMessage={errors.label?.message}
                      isInvalid={!!errors.label}
                    />

                    <Input
                      type="text"
                      label="Nama Penerima"
                      placeholder="Nama orang yang menerima"
                      {...register("receiver")}
                      errorMessage={errors.receiver?.message}
                      isInvalid={!!errors.receiver}
                    />
                  </div>

                  <Map
                    init={[
                      getValues("latitude") ?? 0,
                      getValues("longitude") ?? 0,
                    ]}
                    onAddressChange={(address) => {
                      setValue("latitude", parseFloat(address.lat));
                      setValue("longitude", parseFloat(address.lng));
                      setNewAddress(address);
                    }}
                  />

                  <Autocomplete
                    label="Kelurahan/Kecamatan"
                    placeholder="Ketik minimal 4 karakter"
                    items={suggestions.map((loc) => ({
                      label: loc.name,
                      value: loc.name,
                      description: `${loc.district}, ${loc.city}`,
                    }))}
                    onInputChange={(value) => {
                      if (value.length >= 3) debouncedSearch(value);
                    }}
                    onSelectionChange={(selected) => {
                      const selectedLoc = suggestions.find(
                        (loc) => loc.name === selected
                      );
                      if (selectedLoc) {
                        setValue("sub_district_id", selectedLoc.sub_district_id);
                        setValue("province", selectedLoc.province);
                        setValue("city", selectedLoc.city);
                        setValue("district", selectedLoc.district);
                        setValue("sub_district", selectedLoc.sub_district);
                        setValue("postal_code", selectedLoc.postal_code);
                      }
                    }}
                    isLoading={loadingSuggestions}
                  >
                    {(item) => (
                      <AutocompleteItem
                        key={(item as any).value}
                        description={(item as any).description}
                      >
                        {(item as any).label}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>

                  {/* Display auto-filled regional data */}
                  {formValues.sub_district_id && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-default-100 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-default-400 uppercase font-semibold">Provinsi</span>
                        <span className="text-sm font-medium">{formValues.province || "-"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-default-400 uppercase font-semibold">Kota/Kab</span>
                        <span className="text-sm font-medium">{formValues.city || "-"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-default-400 uppercase font-semibold">Kecamatan</span>
                        <span className="text-sm font-medium">{formValues.district || "-"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-default-400 uppercase font-semibold">Kelurahan</span>
                        <span className="text-sm font-medium">{formValues.sub_district || "-"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-default-400 uppercase font-semibold">Kode Pos</span>
                        <span className="text-sm font-medium">{formValues.postal_code || "-"}</span>
                      </div>
                    </div>
                  )}

                  <Input
                    type="text"
                    label="Alamat"
                    placeholder="Jalan, Nomor, RT/RW"
                    {...register("address")}
                    errorMessage={errors.address?.message}
                    isInvalid={!!errors.address}
                  />

                  <Input
                    type="text"
                    label="Detail Tambahan"
                    placeholder="Patokan, warna rumah, dll"
                    {...register("address_details")}
                    errorMessage={errors.address_details?.message}
                    isInvalid={!!errors.address_details}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={onClose}>
                  Batal
                </Button>
                <Button type="submit" color="primary" isLoading={isSubmitting}>
                  {formValues.id ? "Simpan Perubahan" : "Tambah Alamat"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AddressStep;
