"use client";

import { useParams } from "next/navigation";
import CatalogForm from "@/app/admin/catalog/_Components/CatalogForm";
import CatalogTitle from "@/components/ui/Catalogue/Title";

const EditCatalogPage = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col gap-4">
      <CatalogTitle title="Edit Catalog" description="Submit the form below" />
      <CatalogForm mode="edit" catalogId={id as string} />
    </div>
  );
};

export default EditCatalogPage;
