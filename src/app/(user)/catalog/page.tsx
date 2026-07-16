"use client";

import { Suspense, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "@/components/ui/Catalogue/Filter";
import { Button, Drawer, Input } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import {
  Alert,
  DrawerBody,
  DrawerContent,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { FaSearch } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { BiSolidMegaphone } from "react-icons/bi";
import { useCatalog } from "@/hooks/react-query/catalog";
import { useSettingByKey } from "@/hooks/react-query/settings";
import { UserCatalogCard } from "@/components/ui/Card/Catalog";
import SkeletonCatalogCard from "@/components/ui/Card/Catalog/Skeleton";
import { Categories } from "@/lib/constant/category";

const RentContent = () => {
  const searchParams = useSearchParams();
  const searchQueryFromParams = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(searchQueryFromParams);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [activeFilters, setActiveFilters] = useState({});

  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Use React Query hook with filters for catalog
  const { data: catalogData, isLoading: catalogLoading, error: catalogError } = useCatalog({
    ...activeFilters,
    ...(debouncedSearchQuery ? { search: debouncedSearchQuery } : {}),
  });


  // Fetch announcement setting
  const { data: announcementData } = useSettingByKey("announcement");

  useEffect(() => {
    const newSearchQuery = debouncedSearchQuery.trim();
    const url = newSearchQuery ? `/catalog?q=${newSearchQuery}` : "/catalog";
    if (url !== window.location.pathname + window.location.search) {
      router.replace(url);
    }
  }, [debouncedSearchQuery]);

  const handleFilterChange = (filters: any) => {
    if (searchQuery) {
      setSearchQuery("");
    }
    setActiveFilters(filters);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryPillClick = (categoryKey: string | undefined) => {
    setActiveFilters((prev: any) => ({ ...prev, category: categoryKey }));
  };

  const renderCatalogContent = () => {
    if (catalogLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCatalogCard key={idx} />
          ))}
        </div>
      );
    }

    if (catalogError) {
      return (
        <div className="flex flex-col items-center gap-2">
          <p>Error loading catalog data</p>
        </div>
      );
    }

    if (!catalogData || catalogData.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2">
          <p>Tidak ada katalog</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {catalogData.map((item: any) => (
          <UserCatalogCard key={item.id} catalog={item} />
        ))}
      </div>
    );
  };



  return (
    <>
      {/* Announcement Section - Display at the very top */}
      {announcementData?.visible && announcementData?.value && (
        <Alert
          color="primary"
          variant="faded"
          className="mt-3 mb-2"
          startContent={<BiSolidMegaphone className="text-primary text-xl" />}
        >
          <div
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: announcementData.value }}
          />
        </Alert>
      )}

      <div className="flex flex-col md:flex-row md:justify-center gap-4">
        <Section className="hidden md:block px-4 py-3 gap-4 w-[25%] h-fit md:sticky md:top-0">
          <Filter onFilterChange={handleFilterChange} />
        </Section>

        <div className="flex flex-col gap-6 w-full md:w-[75%]">
          <div className="flex flex-col gap-2">
            <Input
              isClearable
              value={searchQuery}
              name="search"
              color="primary"
              placeholder="Cari Alat Pendakian"
              aria-label="Search catalog"
              startContent={<FaSearch className="text-primary" />}
              onValueChange={handleSearchChange}
            />
            <Button
              color="primary"
              onPress={onOpen}
              className="md:hidden"
              aria-label="Open filter menu"
              startContent={<IoFilter />}
            >
              Filter
            </Button>
          </div>

          {/* Tipe Section */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-primary">Tipe</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                size="sm"
                color={!(activeFilters as any).category ? "primary" : "default"}
                variant={!(activeFilters as any).category ? "solid" : "flat"}
                onPress={() => handleCategoryPillClick(undefined)}
                className="min-w-max rounded-full font-medium px-6"
              >
                All
              </Button>
              {Categories.map((cat) => (
                <Button
                  key={cat.key}
                  size="sm"
                  color={(activeFilters as any).category === cat.key ? "primary" : "default"}
                  variant={(activeFilters as any).category === cat.key ? "solid" : "flat"}
                  onPress={() => handleCategoryPillClick(cat.key)}
                  className="min-w-max rounded-full font-medium px-6"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Catalog Section */}
          <div className="flex flex-col gap-3">
            {renderCatalogContent()}
          </div>
        </div>

        <Drawer
          isOpen={isOpen}
          size="xs"
          placement="left"
          onOpenChange={onOpenChange}
          aria-label="Filter menu"
        >
          <DrawerContent>
            {(onClose) => (
              <DrawerBody className="py-4 overflow-y-auto">
                <Filter
                  onHideDrawer={onClose}
                  onFilterChange={handleFilterChange}
                />
              </DrawerBody>
            )}
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center">
          <Spinner color="primary" variant="simple"></Spinner>
          <h1 className="md:font-semibold">
            Sabar yaa, permintaan kamu lagi diproses...
          </h1>
        </div>
      }
    >
      <RentContent />
    </Suspense>
  );
};

export default Page;
