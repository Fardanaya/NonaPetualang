"use client";

import { AdminAccessoryCard } from "@/components/ui/Card/Accessory";
import { Button, Input } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { useDebounce } from "use-debounce";
import { useAccessories } from "@/hooks/react-query/accessories";
import TableTitle from "@/components/ui/Table/Title";
import SkeletonAccessoryCard from "@/components/ui/Card/Accessory/Skeleton";
import Link from "next/link";

const AccessoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);

  // Use accessories hook with search filter
  const {
    data,
    isLoading: loading,
    error,
  } = useAccessories({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  return (
    <Section className="px-4 py-3 space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <TableTitle title="Accessories" description="List of Accessories" />
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
            href="/admin/accessories/create"
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
            &nbsp;Accessories
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, idx) => (
                <SkeletonAccessoryCard key={idx} />
              ))
            : data?.map((item: any, idx: number) => (
                <AdminAccessoryCard key={idx} accessory={item} />
              ))}
        </div>
      </div>
    </Section>
  );
};

export default AccessoriesPage;
