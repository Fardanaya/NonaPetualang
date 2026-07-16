"use client";

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
  AutocompleteItem,
  SelectItem,
  Spinner,
  AutocompleteSection,
} from "@heroui/react";
import {
  Input,
  Modal,
  Table,
  Button,
  Autocomplete,
  Select,
  Pagination,
} from "@/components/ui/heroui";
import { FaPlus, FaSearch } from "react-icons/fa";
import { Section } from "@/components/ui/Section";
import {
  useCreateOrUpdateCategories,
  useDeleteCategory,
  usePaginatedCategories,
} from "@/hooks/react-query/category";
import { usePagination } from "@/hooks/pagination";
import { presetPagination } from "@/lib/types/pagination";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ICategory,
  categorySchema,
  defaultCategory,
} from "@/lib/types/schemas/category";
import { flattenIdProperties } from "@/lib/utils";
import TableTitle from "@/components/ui/Table/Title";
import TableAction from "@/components/ui/Table/Action";

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

  // Use the paginated categories hook
  const { data: categoriesData, isLoading } = usePaginatedCategories({
    page,
    pageSize,
    searchTerm: debouncedSearch || undefined,
  });

  // Use the mutation hooks
  const createOrUpdateMutation = useCreateOrUpdateCategories();
  const deleteMutation = useDeleteCategory();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ICategory>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultCategory,
  });

  const formValues = watch();

  const onSubmit = async (data: ICategory) => {
    try {
      await createOrUpdateMutation.mutateAsync(data);
      reset(defaultCategory);
      onOpenChange();
    } catch (error) {
      console.error("Failed to create/update category:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleClose = () => {
    reset(defaultCategory);
    onOpenChange();
  };

  return (
    <div className="flex flex-col gap-4">
      <Section className="px-4 py-3 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
          <TableTitle
            title="Category"
            description="Manage categories for your outdoor gears"
          />
          <div className="flex flex-row items-center gap-2">
            <Input
              isClearable
              type="text"
              aria-label="Search"
              placeholder="Search"
              startContent={<FaSearch className="text-primary" />}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <Button
              onPress={() => {
                reset(defaultCategory);
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
                {categoriesData?.pagination?.totalRecords || 0}
              </span>
              &nbsp;Categories
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
          <Table aria-label="Category table" color="primary">
            <TableHeader>
              <TableColumn>Name</TableColumn>
              <TableColumn>Description</TableColumn>
              <TableColumn className="flex justify-center items-center">
                Action
              </TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<Spinner label="Loading..." />}
              items={categoriesData?.data ?? []}
              emptyContent={"No data to display."}
            >
              {(item: ICategory | any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description || "-"}</TableCell>
                  <TableCell className="flex flex-row justify-center items-center gap-2">
                    <TableAction
                      onUpdate={() => {
                        reset(flattenIdProperties(item));
                        onOpen();
                      }}
                      onDelete={() => handleDelete(item.id || "")}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end gap-2">
          {categoriesData?.pagination &&
            categoriesData.pagination.totalPages > 1 && (
              <Pagination
                loop
                showControls
                initialPage={1}
                page={page}
                total={categoriesData.pagination.totalPages}
                onChange={setPage}
              />
            )}
        </div>
      </Section>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>Add Category</ModalHeader>
              <ModalBody>
                <Input
                  label="Category Name"
                  type="text"
                  {...register("name")}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />
                <Input
                  label="Description"
                  type="text"
                  {...register("description")}
                  isInvalid={!!errors.description}
                  errorMessage={errors.description?.message}
                />
              </ModalBody>
              <ModalFooter>
                <Button type="button" onPress={onClose}>
                  Close
                </Button>
                <Button type="submit" color="primary" isLoading={isLoading}>
                  {formValues.id ? "Update" : "Create"}
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
