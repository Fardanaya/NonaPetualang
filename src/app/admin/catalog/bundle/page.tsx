"use client";
import CatalogPage from "@/app/admin/catalog/_Components/Catalog";

const Page = () => {
  return (
    <div className="flex flex-col gap-4">
      <CatalogPage catalogType="bundle" />
    </div>
  );
};

export default Page;
