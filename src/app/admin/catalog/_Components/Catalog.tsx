"use client";

import { AdminCatalogCard } from "@/components/ui/Card/Catalog";
import { Button, Input } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { useDebounce } from "use-debounce";
import { useCatalog } from "@/hooks/react-query/catalog";
import TableTitle from "@/components/ui/Table/Title";
import SkeletonCatalogCard from "@/components/ui/Card/Catalog/Skeleton";
import Link from "next/link";

interface CatalogPageProps {
  catalogType?: "alat" | "bundle";
}

const CatalogPage = ({ catalogType = "alat" }: CatalogPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);

  // Use catalog hook with search filter and catalog type
  const {
    data,
    isLoading: loading,
    error,
  } = useCatalog({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    catalogType: catalogType,
  });

  return (
    <Section className="px-4 py-3 space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <TableTitle
          title={catalogType === "alat" ? "Catalog" : "Bundle Catalog"}
          description="List of Catalog"
        />
        <div className="flex flex-row items-center gap-2">
          <Input
            isClearable
            type="text"
            placeholder="Search"
            startContent={<FaSearch className="text-primary" />}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <Button
            color="primary"
            startContent={<FaPlus />}
            as={Link}
            href={`/admin/catalog/create?type=${catalogType}`}
          >
            Add
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between items-center">
          <p className="text-xs">
            Total&nbsp;
            <span className="font-semibold">{data?.length || 0}</span>
            &nbsp;Catalog
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, idx) => (
                <SkeletonCatalogCard key={idx} />
              ))
            : data?.map((item: any, idx: number) => (
                <AdminCatalogCard key={idx} catalog={item} />
              ))}
        </div>
      </div>
    </Section>
  );
};

export default CatalogPage;
