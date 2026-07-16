"use client";

import { I18nProvider } from "@react-aria/i18n";
import { nanoid } from "nanoid";
import {
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  SelectItem,
  Spinner,
  Switch,
  Chip,
} from "@heroui/react";
import {
  Input,
  Modal,
  Table,
  Button,
  Select,
  DatePicker,
  Pagination,
  NumberInput,
} from "@/components/ui/heroui";
import { FaPlus, FaSearch, FaDice, FaCopy, FaCheck } from "react-icons/fa";
import { Section } from "@/components/ui/Section";
import {
  useCreateOrUpdateVoucher,
  useDeleteVoucher,
} from "@/hooks/react-query/voucher";
import { usePagination } from "@/hooks/pagination";
import { usePaginatedVouchers } from "@/hooks/react-query";
import { presetPagination } from "@/lib/types/pagination";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IVoucherWithApplicability,
  voucherWithApplicabilitySchema,
  defaultVoucherWithApplicability,
} from "@/lib/types/schemas/voucher";
import { useCatalog } from "@/hooks/react-query/catalog";
import { usePaginatedUsers } from "@/hooks/react-query/user";
import {
  useUserVouchersByVoucher,
  useCreateOrUpdateUserVouchers,
  useDeleteUserVoucher,
} from "@/hooks/react-query/user_vouchers";

import TableTitle from "@/components/ui/Table/Title";
import TableAction from "@/components/ui/Table/Action";
import { today, parseDate, getLocalTimeZone } from "@internationalized/date";
import { metadataConfig } from "@/app/config";
import { useEffect, useMemo, useState } from "react";
const discountTypes = [
  { key: "percentage", label: "Percentage" },
  { key: "fixed", label: "Fixed Amount" },
];

const voucherTypes = [
  { key: "public", label: "Public" },
  { key: "private", label: "Private" },
];

// Debounced search hooks
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Generate random voucher code using nanoid library
const generateVoucherCode = () => {
  return nanoid(8).toUpperCase();
};

const Page = () => {
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

  // Input values for search
  const [costumeInputValue, setCostumeInputValue] = useState("");
  const [userInputValue, setUserInputValue] = useState("");

  // Debounced search values
  const debouncedCostumeQuery = useDebouncedValue(costumeInputValue, 300);
  const debouncedUserQuery = useDebouncedValue(userInputValue, 300);

  // Copy button state
  const [copied, setCopied] = useState(false);

  // Handle copy to clipboard
  const handleCopyCode = async () => {
    if (formValues.code) {
      try {
        await navigator.clipboard.writeText(formValues.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error("Failed to copy code:", err);
      }
    }
  };

  // Use the paginated vouchers hook
  const { data: vouchersData, isLoading } = usePaginatedVouchers({
    page,
    pageSize,
    searchTerm: debouncedSearch || undefined,
  });

  // Use the mutation hooks
  const createOrUpdateMutation = useCreateOrUpdateVoucher();
  const deleteMutation = useDeleteVoucher();
  const assignUserMutation = useCreateOrUpdateUserVouchers();
  const removeUserMutation = useDeleteUserVoucher();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useForm<IVoucherWithApplicability>({
    resolver: zodResolver(voucherWithApplicabilitySchema),
    defaultValues: defaultVoucherWithApplicability,
  });

  const formValues = watch();
  const watchedVoucherType = watch("type");
  const watchedApplicability = watch("applicability");

  // Computed value for apply to all switch
  const isApplyToAll = useMemo(() => {
    return watchedApplicability?.some((app: any) => app?.apply_to_all) || false;
  }, [watchedApplicability]);

  // Additional data for form
  const { data: catalogData } = useCatalog();

  // User assignment data for private vouchers
  const { data: usersData, isLoading: usersLoading } = usePaginatedUsers({
    pageSize: 50, // Load more users for selection
  });
  const { data: assignedUsers = [] } = useUserVouchersByVoucher(formValues.id);

  // Debug form state - Remove this in production
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Form values changed:", formValues);
      console.log("Form errors:", errors);
      console.log("Applicability:", formValues.applicability);
    }
  }, [formValues, errors]);

  // Computed filtered items based on debounced queries
  const filteredCostumes = useMemo(() => {
    if (!catalogData) return [];

    return catalogData
      .filter(
        (catalog: any) =>
          !watchedApplicability?.some(
            (app: any) => app.catalog_id === catalog.id
          )
      )
      .filter((catalog: any) => {
        if (!debouncedCostumeQuery) return true;
        const searchName = catalog.name?.toLowerCase() || "";
        const searchSlug = catalog.slug?.toLowerCase() || "";
        const query = debouncedCostumeQuery.toLowerCase();
        return searchName.includes(query) || searchSlug.includes(query);
      })
      .slice(0, 10);
  }, [catalogData, watchedApplicability, debouncedCostumeQuery]);

  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];

    const assignedUserIds = assignedUsers.map((ua: any) => ua.users?.id);

    return usersData.data
      .filter((user: any) => !assignedUserIds.includes(user.id))
      .filter((user: any) => {
        if (!debouncedUserQuery) return true;
        const searchName = (user.name || user.full_name)?.toLowerCase() || "";
        const searchEmail = user.email?.toLowerCase() || "";
        const query = debouncedUserQuery.toLowerCase();
        return searchName.includes(query) || searchEmail.includes(query);
      })
      .slice(0, 10);
  }, [usersData?.data, assignedUsers, debouncedUserQuery]);

  // Simple costume selection handlers
  const onCostumeSelectionChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0] as string;
    if (selectedKey) {
      // Clear input and update form applicability
      setCostumeInputValue("");

      const existingApplicability = watchedApplicability || [];
      const newApplicability = [
        ...existingApplicability,
        {
          apply_to_all: false,
          catalog_id: selectedKey,
        },
      ];
      setValue("applicability", newApplicability);
    }
  };

  // Simple user selection handlers
  const onUserSelectionChange = async (keys: any) => {
    const selectedKey = Array.from(keys)[0] as string;
    if (selectedKey) {
      // Check if user is already assigned
      const isAlreadyAssigned = assignedUsers.some(
        (ua: any) => ua.users?.id === selectedKey
      );

      if (!isAlreadyAssigned) {
        // Clear input and add user assignment
        setUserInputValue("");

        try {
          await assignUserMutation.mutateAsync({
            user_id: selectedKey,
            vouchers_id: formValues.id,
            usage_count: 0,
          });
        } catch (error) {
          console.error("Failed to assign user:", error);
        }
      }
    }
  };

  const handleClose = () => {
    reset(defaultVoucherWithApplicability);
    setCopied(false); // Reset copy button state
    onOpenChange();
  };

  const handleCreateOrUpdate = (
    item?: IVoucherWithApplicability & { voucher_applicability?: any[] }
  ) => {
    if (item) {
      // Map voucher_applicability to applicability for form compatibility
      const formData = {
        ...item,
        applicability: item.voucher_applicability || item.applicability || [],
      };
      console.log("handleCreateOrUpdate - Item data:", item);
      console.log("handleCreateOrUpdate - Form data to reset:", formData);
      reset(formData);
    } else {
      reset(defaultVoucherWithApplicability);
    }
    onOpen();
  };

  const onSubmit = async (data: IVoucherWithApplicability) => {
    console.log("Before manual validation - Form values:", formValues);
    console.log("Before manual validation - Form errors:", errors);

    // Check individual field validation
    const isValid = await trigger();
    console.log("After trigger validation - Form is valid:", isValid);
    console.log("After trigger validation - Form errors:", errors);
    console.log("After trigger validation - errors.root:", errors.root);
    console.log(
      "After trigger validation - errors.applicability:",
      errors.applicability
    );

    if (!isValid) {
      console.log("Form validation failed - stopping submission");
      return;
    }

    console.log("Submitting data after validation:", data);
    console.log("Applicability details:", data.applicability);

    try {
      await createOrUpdateMutation.mutateAsync(data);
      handleClose();
    } catch (error) {
      console.error("Failed to create/update voucher:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete voucher:", error);
    }
  };

  const handleAddApplicability = () => {
    const currentApplicability = watch("applicability") || [];
    setValue("applicability", [
      ...currentApplicability,
      { apply_to_all: false, catalog_id: null },
    ]);
  };

  const handleRemoveApplicability = (index: number) => {
    const currentApplicability = watch("applicability") || [];
    const updatedApplicability = currentApplicability.filter(
      (_, i) => i !== index
    );
    setValue(
      "applicability",
      updatedApplicability.length > 0
        ? updatedApplicability
        : [
            {
              apply_to_all: false,
              catalog_id: null,
            },
          ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(metadataConfig.locale, {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const getApplicabilityDescription = (
    voucher: IVoucherWithApplicability & { voucher_applicability?: any[] }
  ) => {
    const applicability =
      voucher.applicability || voucher.voucher_applicability || [];
    if (applicability?.some((a) => a.apply_to_all)) {
      return "All Catalogs";
    }

    if (!applicability || applicability.length === 0) {
      return "All Items";
    }

    const hasSpecificProducts = applicability.some((app) => app.catalog_id);
    return hasSpecificProducts ? "Selected Products" : "All Items";
  };

  return (
    <div className="flex flex-col gap-4">
      <Section className="px-4 py-3 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
          <TableTitle
            title="Vouchers"
            description="Manage discount vouchers for your marketplace"
          />
          <div className="flex flex-row items-center gap-2">
            <Input
              isClearable
              type="text"
              aria-label="Search"
              placeholder="Search vouchers"
              startContent={<FaSearch className="text-primary" />}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <Button
              onPress={() => handleCreateOrUpdate()}
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
                {vouchersData?.pagination?.totalRecords || 0}
              </span>
              &nbsp;Vouchers
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs">Showing</span>
              <Select
                disallowEmptySelection
                size={"xs" as any}
                aria-label="Page Size"
                variant="bordered"
                classNames={{ trigger: "bg-default-50" }}
                className="w-20"
                selectedKeys={[pageSize.toString()]}
                onSelectionChange={(keys) => {
                  const size = Number(Array.from(keys)[0]);
                  setPageSize(size);
                  setPage(1);
                }}
                items={presetPagination}
              >
                {(item: any) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                )}
              </Select>
            </div>
          </div>
          <Table aria-label="Vouchers table" color="primary">
            <TableHeader>
              <TableColumn>Code</TableColumn>
              <TableColumn>Name</TableColumn>
              <TableColumn>Discount</TableColumn>
              <TableColumn>Type</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Applicability</TableColumn>
              <TableColumn className="flex justify-center items-center">
                Action
              </TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<Spinner label="Loading..." />}
              items={vouchersData?.data ?? []}
              emptyContent={"No vouchers available."}
            >
              {(item: IVoucherWithApplicability) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Chip color="primary" size="sm" variant="flat">
                      {item.code}
                    </Chip>
                  </TableCell>
                  <TableCell>{item.name || "N/A"}</TableCell>
                  <TableCell>
                    {item.discount_type === "percentage"
                      ? `${item.discount_value}%`
                      : formatCurrency(item.discount_value || 0)}
                  </TableCell>
                  <TableCell>
                    {voucherTypes.find((t) => t.key === item.type)?.label}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={item.is_enable ? "success" : "danger"}
                      size="sm"
                      variant={item.is_enable ? "flat" : "bordered"}
                    >
                      {item.is_enable ? "Active" : "Inactive"}
                    </Chip>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-xs text-gray-600 truncate">
                      {getApplicabilityDescription(item)}
                    </span>
                  </TableCell>
                  <TableCell className="flex flex-row justify-center items-center gap-2">
                    <TableAction
                      onUpdate={() => handleCreateOrUpdate(item)}
                      onDelete={() => handleDelete(item.id || "")}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end gap-2">
          {vouchersData?.pagination &&
            vouchersData.pagination.totalPages > 1 && (
              <Pagination
                loop
                showControls
                initialPage={1}
                page={page}
                total={vouchersData.pagination.totalPages}
                onChange={setPage}
              />
            )}
        </div>
      </Section>

      <Modal
        isOpen={isOpen}
        onOpenChange={handleClose}
        size="4xl"
        scrollBehavior="outside"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>
                {formValues.id ? "Edit Voucher" : "Create Voucher"}
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <Input
                  label="Voucher Name"
                  type="text"
                  {...register("name")}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-2 items-end w-full">
                    <Controller
                      name="code"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          isRequired
                          isReadOnly={!!formValues.id} // Read-only when editing
                          label="Voucher Code"
                          type="text"
                          isInvalid={!!errors.code}
                          errorMessage={errors.code?.message}
                        />
                      )}
                    />
                    {formValues.id ? (
                      // Copy button for edit mode
                      <Button
                        isIconOnly
                        color={copied ? "success" : "primary"}
                        onPress={handleCopyCode}
                        title="Copy code to clipboard"
                      >
                        {copied ? <FaCheck /> : <FaCopy />}
                      </Button>
                    ) : (
                      // Generate button for create mode
                      <Button
                        isIconOnly
                        color={"primary"}
                        onPress={() => {
                          const newCode = generateVoucherCode();
                          setValue("code", newCode);
                          trigger("code");
                        }}
                      >
                        <FaDice />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-end pb-1.5">
                    <Controller
                      name="is_enable"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Switch
                            isSelected={field.value}
                            onValueChange={field.onChange}
                          />
                          <div className="flex flex-col">
                            <p className="text-medium leading-none">
                              {field.value ? "Active" : "Inactive"}
                            </p>
                            <p className="text-xs text-default-500">
                              {field.value
                                ? "Voucher ini dapat digunakan"
                                : "Voucher ini tidak dapat digunakan"}
                            </p>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Discount Configuration */}
                <div className="grid grid-cols-1 md:flex items-center gap-4">
                  <div className="w-[35%]">
                    <Controller
                      name="discount_type"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Discount Type"
                          variant="bordered"
                          selectedKeys={[field.value]}
                          onSelectionChange={(keys) =>
                            field.onChange(Array.from(keys)[0])
                          }
                          isInvalid={!!errors.discount_type}
                          errorMessage={errors.discount_type?.message}
                        >
                          {discountTypes.map((type) => (
                            <SelectItem key={type.key}>{type.label}</SelectItem>
                          ))}
                        </Select>
                      )}
                    />
                  </div>

                  <Controller
                    name="discount_value"
                    control={control}
                    render={({ field }) => (
                      <NumberInput
                        value={field.value}
                        onValueChange={(value) => field.onChange(Number(value))}
                        label={`Amount ${
                          formValues.discount_type === "percentage" ? "(%)" : ""
                        }`}
                        isInvalid={!!errors.discount_value}
                        errorMessage={errors.discount_value?.message}
                      />
                    )}
                  />
                </div>

                {/* Voucher Type and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        disallowEmptySelection
                        label="Voucher Type"
                        variant="bordered"
                        selectedKeys={[field.value]}
                        onSelectionChange={(keys) =>
                          field.onChange(Array.from(keys)[0])
                        }
                        isInvalid={!!errors.type}
                        errorMessage={errors.type?.message}
                        isDisabled={!!formValues.id}
                      >
                        {voucherTypes.map((type) => (
                          <SelectItem key={type.key}>{type.label}</SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="start_date"
                    control={control}
                    render={({ field }) => (
                      <I18nProvider locale={metadataConfig.locale}>
                        <DatePicker
                          label="Start Date"
                          variant="bordered"
                          value={
                            field.value && typeof field.value === "string"
                              ? parseDate(field.value.split("T")[0])
                              : null
                          }
                          onChange={(date) => field.onChange(date?.toString())}
                        />
                      </I18nProvider>
                    )}
                  />

                  <Controller
                    name="end_date"
                    control={control}
                    render={({ field }) => (
                      <I18nProvider locale={metadataConfig.locale}>
                        <DatePicker
                          label="End Date"
                          variant="bordered"
                          isDateUnavailable={(date) => {
                            const todayDate = today(getLocalTimeZone());
                            const startDate = formValues.start_date && typeof formValues.start_date === "string"
                              ? parseDate(formValues.start_date.split("T")[0])
                              : null;
                            return date < todayDate || (startDate ? date < startDate : false);
                          }}
                          value={
                            field.value && typeof field.value === "string"
                              ? parseDate(field.value.split("T")[0])
                              : null
                          }
                          onChange={(date) => field.onChange(date?.toString())}
                        />
                      </I18nProvider>
                    )}
                  />
                </div>

                
                {/* Usage Limits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="usage_limit"
                    control={control}
                    render={({ field }) => (
                      <NumberInput
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                        label="Usage Limit (Total)"
                        isInvalid={!!errors.usage_limit}
                        errorMessage={errors.usage_limit?.message}
                      />
                    )}
                  />

                  <Controller
                    name="per_user_limit"
                    control={control}
                    render={({ field }) => (
                      <NumberInput
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                        label="Per User Limit"
                        isInvalid={!!errors.per_user_limit}
                        errorMessage={errors.per_user_limit?.message}
                      />
                    )}
                  />
                </div>

                {/* Applicability Settings */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-4">Applicability</h3>

                  {/* Display validation error for costume selection */}
                  {(errors.root || (errors as any)[""]) && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-medium text-red-700 mb-2">
                        Applicability Configuration Error
                      </p>
                      <p className="text-sm text-red-600">
                        {(errors.root || (errors as any)[""])?.message}
                      </p>
                    </div>
                  )}

                  {/* Apply to All Costumes */}
                  <div className="flex items-center gap-3 mb-4">
                    <Switch
                      isSelected={isApplyToAll}
                      onValueChange={(value) => {
                        if (value) {
                          // Clear specific products when enabling all
                          setValue("applicability", [
                            { apply_to_all: true, catalog_id: null },
                          ]);
                        } else {
                          // Clear apply_to_all and revert to specific products if any
                          const currentApplicability =
                            watchedApplicability || [];
                          const filteredApplicability = currentApplicability
                            .filter((app: any) => app.catalog_id)
                            .map((app: any) => ({
                              apply_to_all: false,
                              catalog_id: app.catalog_id,
                            }));

                          setValue(
                            "applicability",
                            filteredApplicability.length > 0
                              ? filteredApplicability
                              : [{ apply_to_all: false, catalog_id: null }]
                          );
                        }
                      }}
                    />
                    <div>
                      <span className="font-medium">Apply to All Catalogs</span>
                      <p className="text-xs text-gray-600">
                        When enabled, voucher applies to all catalog
                        items
                      </p>
                    </div>
                  </div>

                  {/* Specific Products Multi-Select */}
                  {!isApplyToAll && (
                    <div className="space-y-4">
                      {/* Add Costume Section */}
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <Input
                            label="Search Costumes"
                            variant="bordered"
                            value={costumeInputValue}
                            onValueChange={setCostumeInputValue}
                            startContent={<FaSearch className="text-primary" />}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                          {filteredCostumes.map((catalog: any) => (
                            <div
                              key={catalog.id}
                              onClick={() =>
                                onCostumeSelectionChange([catalog.id])
                              }
                              className="p-4 border rounded-lg cursor-pointer hover:bg-primary-50 transition-colors bg-white shadow-sm hover:shadow-md"
                            >
                              <div className="flex flex-col gap-2">
                                {catalog.images?.[0] && (
                                  <img
                                    src={catalog.images[0]}
                                    alt={catalog.name}
                                    className="w-full h-24 object-cover rounded-md"
                                  />
                                )}
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm">
                                    {catalog.name || "Unnamed Product"}
                                  </span>
                                  {catalog.slug && (
                                    <span className="text-xs text-gray-500">
                                      {catalog.slug}
                                    </span>
                                  )}
                                  {catalog.price && (
                                    <span className="text-xs text-green-600 font-medium">
                                      {formatCurrency(catalog.price)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {filteredCostumes.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500">
                              {costumeInputValue
                                ? "No costumes found matching your search"
                                : "Type to search for costumes"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Currently Selected Costumes */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Currently Selected Costumes (
                          {watchedApplicability?.filter(
                            (a: any) => a.catalog_id
                          ).length || 0}
                          )
                        </h4>

                        {!watchedApplicability ||
                        watchedApplicability.filter((a: any) => a.catalog_id)
                          .length === 0 ? (
                          <p className="text-xs text-gray-500 italic">
                            No costumes selected yet. Select costumes above to
                            add them.
                          </p>
                        ) : (
                          <div className="border rounded-lg overflow-hidden">
                            <Table
                              aria-label="Selected costumes table"
                              color="primary"
                            >
                              <TableHeader>
                                <TableColumn>Name</TableColumn>
                                <TableColumn>Slug</TableColumn>
                                <TableColumn className="flex justify-center items-center">
                                  Action
                                </TableColumn>
                              </TableHeader>
                              <TableBody
                                items={
                                  watchedApplicability?.filter(
                                    (a: any) => a.catalog_id
                                  ) || []
                                }
                              >
                                {(applicability: any) => {
                                  const catalog = catalogData?.find(
                                    (c: any) =>
                                      c.id === applicability.catalog_id
                                  );
                                  return (
                                    <TableRow key={applicability.catalog_id}>
                                      <TableCell>
                                        {catalog?.name || "Unknown Costume"}
                                      </TableCell>
                                      <TableCell>
                                        {catalog?.slug || "-"}
                                      </TableCell>
                                      <TableCell className="flex justify-center items-center">
                                        <Button
                                          size="sm"
                                          color="danger"
                                          onPress={() => {
                                            const newApplicability =
                                              watchedApplicability?.filter(
                                                (a: any) =>
                                                  a.catalog_id !==
                                                  applicability.catalog_id
                                              ) || [];
                                            setValue(
                                              "applicability",
                                              newApplicability
                                            );
                                          }}
                                        >
                                          Remove
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                }}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Assignment Section - Only for Private Vouchers with ID */}
                {formValues.id && formValues.type === "private" && (
                  <div className="flex flex-col gap-4 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      User Assignments
                    </h3>
                    <p className="text-xs text-gray-600 mb-4">
                      Assign this private voucher to specific users. Users will
                      be able to see and use this voucher in their accounts.
                    </p>

                    {/* Add User Section */}
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <Input
                          label="Search Users"
                          variant="bordered"
                          value={userInputValue}
                          onValueChange={setUserInputValue}
                          startContent={<FaSearch className="text-primary" />}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                        {filteredUsers.map((user: any) => (
                          <div
                            key={user.id}
                            onClick={() => onUserSelectionChange([user.id])}
                            className="p-4 border rounded-lg cursor-pointer hover:bg-primary-50 transition-colors bg-white shadow-sm hover:shadow-md"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-lg">
                                {(
                                  user.name ||
                                  user.full_name ||
                                  user.email ||
                                  "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">
                                  {user.name ||
                                    user.full_name ||
                                    user.email ||
                                    "N/A"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {user.email || "No email"}
                                </span>
                                {user.instagram && (
                                  <span className="text-xs text-blue-600">
                                    @{user.instagram}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {filteredUsers.length === 0 && (
                          <div className="col-span-full text-center py-8 text-gray-500">
                            {userInputValue
                              ? "No users found matching your search"
                              : "Type to search for users"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Currently Assigned Users */}
                    <div className="flex flex-col gap-2">
                      <h4 className="font-medium text-sm">
                        Currently Assigned Users ({assignedUsers.length})
                      </h4>

                      {assignedUsers.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">
                          No users assigned yet. Select a user above to add
                          them.
                        </p>
                      ) : (
                        <div className="border rounded-lg overflow-hidden">
                          <Table
                            aria-label="Assigned users table"
                            color="primary"
                          >
                            <TableHeader>
                              <TableColumn>Name</TableColumn>
                              <TableColumn>Email</TableColumn>
                              <TableColumn>Instagram</TableColumn>
                              <TableColumn>Usage Count</TableColumn>
                              <TableColumn className="flex justify-center items-center">
                                Action
                              </TableColumn>
                            </TableHeader>
                            <TableBody items={assignedUsers}>
                              {(assignment: any) => (
                                <TableRow key={assignment.id}>
                                  <TableCell>
                                    {assignment.users?.name ||
                                      assignment.users?.full_name ||
                                      assignment.users?.email ||
                                      "Unknown User"}
                                  </TableCell>
                                  <TableCell>
                                    {assignment.users?.email || "-"}
                                  </TableCell>
                                  <TableCell>
                                    {assignment.users?.instagram
                                      ? `@${assignment.users.instagram}`
                                      : "-"}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      size="sm"
                                      color="primary"
                                      variant="flat"
                                    >
                                      {assignment.usage_count || 0}
                                    </Chip>
                                  </TableCell>
                                  <TableCell className="flex justify-center items-center">
                                    <Button
                                      size="sm"
                                      color="danger"
                                      onPress={() => {
                                        removeUserMutation.mutateAsync(
                                          assignment.id
                                        );
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button type="button" onPress={onClose}>
                  Cancel
                </Button>
                <Button type="submit" color="primary" isLoading={isLoading}>
                  {formValues.id ? "Update Voucher" : "Create Voucher"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Page;
