import dynamic from "next/dynamic";
import AddressCard from "@/components/ui/Card/Address";
import SkeletonAddressCard from "@/components/ui/Card/Address/Skeleton";
import { Button, Input, Modal, Autocomplete } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import { useMemo, useEffect, useState, useRef } from "react";
import { LuMapPin } from "react-icons/lu";
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  AutocompleteItem,
} from "@heroui/react";
import {
  useAddress,
  useCreateOrUpdateAddress,
  useDeleteAddress,
} from "@/hooks/react-query/address";
import { useSession } from "@/components/providers/SessionProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addressSchema,
  defaultAddress,
  IAddress,
} from "@/lib/types/schemas/address";
import { flattenIdProperties, displayToast } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import { fetchAddressSuggestions } from "@/lib/fetch";
import { FaSearch } from "react-icons/fa";

const AddressPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data: list, isLoading: loading } = useAddress({ user_id: user?.id });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [newAddress, setNewAddress] = useState({
    lat: "",
    lng: "",
    address: "",
  });

  const createOrUpdateMutation = useCreateOrUpdateAddress();
  const deleteMutation = useDeleteAddress();

  // React Hook Form with Zod validation
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
  }, 1000);

  const formValues = watch();

  const handleClose = () => {
    reset(defaultAddress);
    setSuggestions([]);
    onOpenChange();
  };

  const onSubmit = async (formData: IAddress) => {
    console.log("🎉 onSubmit called! Form data:", formData);
    const dataToSubmit = { ...formData, user_id: user?.id };
    if (!dataToSubmit.id) {
      delete dataToSubmit.id;
    }
    console.log("Submitting form data:", dataToSubmit);
    try {
      await createOrUpdateMutation.mutateAsync(dataToSubmit);
      handleClose();
    } catch (error) {
      console.error("Failed to create/update address:", error);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/ui/Map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );

  return (
    <Section className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LuMapPin className="text-primary" size={20} />
          <h2 className="font-semibold text-lg">Alamat Tersimpan</h2>
        </div>
        <span className="text-xs text-default-500 bg-default-100 px-2 py-1 rounded">
          {list?.length || 0} alamat
        </span>
      </div>

      {/* Address List */}
      <div className="flex flex-col gap-4 mb-4">
        {loading ? (
          <SkeletonAddressCard />
        ) : (
          <>
            {!list?.length && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-4">
                  <LuMapPin className="text-default-300" size={28} />
                </div>
                <p className="text-default-600 font-medium mb-1">Belum ada alamat</p>
                <p className="text-sm text-default-400 mb-4">
                  Tambahkan alamat untuk mempermudah pengiriman
                </p>
              </div>
            )}
            {list?.map((item: IAddress) => (
              <AddressCard
                key={item.id}
                data={item}
                onUpdate={(data) => {
                  reset(data);
                  onOpen();
                }}
                onDelete={handleDelete}
                hideMap={isOpen}
              />
            ))}
          </>
        )}
      </div>
      
      <Button
        fullWidth
        color="primary"
        startContent={<LuMapPin size={16} />}
        onPress={() => {
          onOpen();
          reset();
        }}
      >
        Tambah Alamat Baru
      </Button>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <ModalContent className="max-h-[90vh] overflow-y-auto">
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>Address</ModalHeader>
              <ModalBody className="overflow-y-auto">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-2">
                    <input type="hidden" {...register("id")} />

                    <Input
                      type="text"
                      label="Label"
                      {...register("label")}
                      errorMessage={errors.label?.message}
                      isInvalid={!!errors.label}
                    />

                    <Input
                      type="text"
                      label="Penerima"
                      {...register("receiver")}
                      errorMessage={errors.receiver?.message}
                      isInvalid={!!errors.receiver}
                    />
                  </div>

                  <Autocomplete
                    label="Cari Kelurahan/Kecamatan"
                    items={suggestions.map((loc) => ({
                      label: loc.name,
                      value: loc.name,
                      description: `${loc.district}, ${loc.city}`,
                    }))}
                    onInputChange={(value) => {
                      if (value.length >= 3) debouncedSearch(value);
                    }}
                    onSelectionChange={(selected) => {
                      // Find the selected location object
                      const selectedLoc = suggestions.find(loc => loc.name === selected);
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
                    startContent={
                      <FaSearch size={16} className="text-primary" />
                    }
                  >
                    {(item) => (
                      <AutocompleteItem key={(item as any).value} description={(item as any).description}>
                        {(item as any).label}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>

                  {/* Display auto-filled regional data */}
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
                    label="Patokan"
                    {...register("address_details")}
                    errorMessage={errors.address_details?.message}
                    isInvalid={!!errors.address_details}
                  />

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
                </div>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Close</Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isSubmitting}
                >
                  {formValues.id ? "Update" : "Create"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </Section>
  );
};

export default AddressPage;
