"use client";

import UserCard from "@/components/ui/Card/User";
import TableTitle from "@/components/ui/Table/Title";
import SkeletonUserCard from "@/components/ui/Card/User/Skeleton";
import { Input, Pagination, Select } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import { presetPagination } from "@/lib/types/pagination";
import { SelectItem } from "@heroui/react";
import { FaSearch } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { usePaginatedUsers } from "@/hooks/react-query/user";
import { usePagination } from "@/hooks/pagination";
const UserPage = () => {
  const { id } = useParams();
  const router = useRouter();

  // Use the pagination hook following master pattern
  const {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    pageSize,
    setPageSize,
    debouncedSearch,
  } = usePagination();

  // Use paginated users hook with server-side pagination
  const { data, error, isLoading } = usePaginatedUsers({
    page,
    pageSize,
    searchTerm: debouncedSearch || undefined,
  });

  return (
    <Section className="px-4 py-3 space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <TableTitle title="User" description="List of All User" />
        <div className="flex flex-row items-center gap-2">
          <Input
            isClearable
            type="text"
            placeholder="Search"
            startContent={<FaSearch className="text-primary" />}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between items-center">
          <p className="text-xs">
            Total&nbsp;
            <span className="font-semibold">
              {data?.pagination?.totalRecords || 0}
            </span>
            &nbsp;User
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {isLoading
            ? Array.from({ length: pageSize }).map((_, idx) => (
                <SkeletonUserCard key={idx} />
              ))
            : data?.data.map((item: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => router.push(`/admin/user/${item.id}`)}
                  className="cursor-pointer"
                >
                  <UserCard item={item} />
                </div>
              ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {(data?.pagination?.totalPages || 0) > 1 && (
          <Pagination
            loop
            showControls
            initialPage={1}
            page={page}
            total={data?.pagination?.totalPages || 0}
            onChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>
    </Section>
  );
};

export default UserPage;
