"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CatalogForm from "@/app/admin/catalog/_Components/CatalogForm";
import CatalogTitle from "@/components/ui/Catalogue/Title";

const CreateCatalogContent = () => {
  const searchParams = useSearchParams();
  const catalogType = searchParams.get("type") as "alat" | "bundle" | null;

  return (
    <div className="flex flex-col gap-4">
      <CatalogTitle
        title="Create Catalog"
        description="Submit the form below"
      />
      <CatalogForm mode="create" catalogType={catalogType || "alat"} />
    </div>
  );
};

const CreateCatalogPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateCatalogContent />
    </Suspense>
  );
};

export default CreateCatalogPage;
