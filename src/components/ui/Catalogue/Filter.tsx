"use client";

import {
  Autocomplete,
  Button,
  NumberInput,
  Select,
} from "@/components/ui/heroui";
import { Slider } from "@heroui/react";
import { AutocompleteItem, SelectItem } from "@heroui/react";
import { Divider } from "@heroui/react";
import { RangeCalendar } from "../Calendar";
import { SectionTitle } from "../Section";
import { useBrand } from "@/hooks/react-query/brand";

import { Categories } from "@/lib/constant/category";
import { useState } from "react";
import { z } from "zod";
import { InputError } from "../Input";

const filterSchema = z
  .object({
    name: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(["ready", "soon"]).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.maxPrice > data.minPrice;
      }
      return true;
    },
    {
      message: "Max price must be greater than min price",
      path: ["maxPrice"],
    }
  );

export const Filter = ({
  onFilterChange,
  onHideDrawer,
}: {
  onFilterChange: (filters: any) => void;
  onHideDrawer?: () => void;
}) => {
  const { data: brands = [] } = useBrand();
  const [filters, setFilters] = useState<z.infer<typeof filterSchema>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <aside className="flex flex-col gap-4">
      <SectionTitle title="Filter" description="Filter the catalogue" />
      <Divider className="bg-primary opacity-50" />
      <div className="rounded-medium gap-2 flex flex-col">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium">Ketersediaan</p>
          <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              size="sm"
              color={filters.status === "ready" ? "primary" : "default"}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: prev.status === "ready" ? undefined : "ready",
                }))
              }
            >
              Available
            </Button>
            <Button
              size="sm"
              color={filters.status === "soon" ? "primary" : "default"}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: prev.status === "soon" ? undefined : "soon",
                }))
              }
            >
              Soon
            </Button>
            <Button
              size="sm"
              color={!filters.status ? "primary" : "default"}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: undefined,
                }))
              }
            >
              All
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium">Batas Harga</p>
          <Slider
            aria-label="Price range"
            color="primary"
            size="sm"
            minValue={0}
            maxValue={1000000}
            step={10000}
            value={[
              filters.minPrice ?? 0,
              filters.maxPrice ?? 1000000,
            ]}
            onChange={(value) => {
              const [min, max] = value as [number, number];
              setFilters((prev) => ({
                ...prev,
                minPrice: min,
                maxPrice: max,
              }));
            }}
            formatOptions={{
              style: "currency",
              currency: "IDR",
            }}
            showTooltip={true}
            showSteps={true}
            className="max-w-md"
          />
          {(errors.minPrice || errors.maxPrice) && (
            <InputError message={errors.minPrice || errors.maxPrice} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium">Brand</p>
            <Select
              aria-label="Costume brand filter"
              color="primary"
              selectedKeys={
                filters.brand ? new Set([filters.brand]) : new Set()
              }
              onSelectionChange={(keys) => {
                const selected = keys === "all" ? undefined : [...keys][0];
                setFilters((prev) => ({
                  ...prev,
                  brand: selected ? String(selected) : undefined,
                }));
              }}
            >
              {brands?.map((brand: any) => (
                <SelectItem key={brand.id}>{brand.name}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium">Category</p>
            <Select
              aria-label="Costume category filter"
              color="primary"
              selectedKeys={
                filters.category ? new Set([filters.category]) : new Set()
              }
              onSelectionChange={(keys) => {
                const selected = keys === "all" ? undefined : [...keys][0];
                setFilters((prev) => ({
                  ...prev,
                  category: selected ? String(selected) : undefined,
                }));
              }}
            >
              {Categories.map((cat) => (
                <SelectItem key={cat.key}>{cat.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>


      </div>
      <Divider className="bg-primary opacity-50" />
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="bordered"
          color="primary"
          onPress={() => {
            setFilters({
              name: undefined,
              brand: undefined,
              category: undefined,
              status: undefined,
              minPrice: 0,
              maxPrice: 1000000,
            });
            onFilterChange({});
          }}
        >
          Reset
        </Button>
        <Button
          size="sm"
          color="primary"
          onPress={async () => {
            try {
              const filtersToValidate = { ...filters };
              if (filters.minPrice === 0 && filters.maxPrice === 1000000) {
                delete filtersToValidate.minPrice;
                delete filtersToValidate.maxPrice;
              }
              const validated = await filterSchema.parseAsync(filtersToValidate);
              setErrors({});
              onFilterChange(validated);
              if (onHideDrawer) onHideDrawer();
            } catch (err) {
              if (err instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                err.issues.forEach((issue) => {
                  if (issue.path[0] && typeof issue.path[0] === "string") {
                    newErrors[issue.path[0]] = issue.message;
                  }
                });
                setErrors(newErrors);
              }
            }
          }}
        >
          Apply
        </Button>
      </div>
    </aside>
  );
};
