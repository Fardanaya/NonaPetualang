"use client";

import { Input, Pagination, Select } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import { presetPagination } from "@/lib/types/pagination";
import { SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/navigation";
import {
  depositExtendedTransactionStatus,
  useUserTransactions,
  transactionStatus,
} from "@/hooks/react-query/transaction";
import { useSession } from "@/components/providers/SessionProvider";
import TableTitle from "@/components/ui/Table/Title";
import { usePagination } from "@/hooks/pagination";
import SkeletonOrderCard from "@/components/ui/Card/Order/Skeleton";
import UserOrderCard from "@/components/ui/Card/Order/UserOrderCard";

const page = () => {
  const router = useRouter();
  const { user: sessionUser } = useSession();
  const [loadPage, setLoadPage] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<Set<string>>(
    new Set([
      "deposit",
      "pending",
      "waiting",
      "dp",
      "paid",
      "sending",
      "returning",
      "settlement",
    ])
  );

  const { data: transactions = [], isLoading: loading } = useUserTransactions(sessionUser?.id || '');

  // Filter transactions by status first
  const statusFilteredTransactions = transactions.filter((item: any) => 
    selectedStatus.size === 0 || selectedStatus.has(item.status?.toLowerCase())
  );

  // Use pagination hook with search
  const {
    searchTerm: search,
    setSearchTerm: setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    paginatedData: filteredList,
    totalItems: totalData
  } = usePagination(statusFilteredTransactions, {
    searchFields: [], // We use custom filter
    customFilter: (item: any, term) => 
      item.catalog?.name?.toLowerCase().includes(term.toLowerCase())
  });

  useEffect(() => {
    setLoadPage(false);
  }, []);

  return (
    <Section className="px-4 py-3 space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <TableTitle title="Order" description="List of All Orders" />
        <div className="flex flex-row items-center gap-2">
          <Select
            selectionMode="multiple"
            variant="bordered"
            className="w-60"
            aria-label="Sort by Status"
            placeholder="Sort by Status"
            selectedKeys={selectedStatus}
            onSelectionChange={(keys) => {
              setSelectedStatus(keys as Set<string>);
            }}
            disallowEmptySelection
            items={depositExtendedTransactionStatus}
          >
            {(item: any) => (
              <SelectItem key={item.value}>{item.label}</SelectItem>
            )}
          </Select>

          <Input
            type="text"
            placeholder="Search"
            startContent={<FaSearch className="text-primary" />}
            value={search}
            onValueChange={(e) => setSearch(e)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between items-center">
          <p className="text-xs">
            Total&nbsp;<span className="font-semibold">{totalData}</span>
            &nbsp;Orders
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {loading || loadPage
            ? Array.from({ length: pageSize }).map((_, idx) => (
                <SkeletonOrderCard key={idx} />
              ))
            : filteredList
                .map((item: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      router.push(`/order/${item.id}`);
                    }}
                    className="cursor-pointer"
                  >
                    <UserOrderCard item={item} />
                  </div>
                ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Pagination
          loop
          showControls
          initialPage={1}
          page={page}
          total={Math.ceil(totalData / pageSize) || 1}
          onChange={setPage}
        />
      </div>
    </Section>
  );
};

export default page;
