"use client";

import AccessoryForm from "@/app/admin/accessories/_Components/AccessoryForm";
import CatalogTitle from "@/components/ui/Catalogue/Title";

const CreateAccessoryPage = () => {
 return (
    <div className="flex flex-col gap-4">
      <CatalogTitle
        title="Create Accessory"
        description="Submit the form below"
      />
      <AccessoryForm mode="create" />
    </div>
  );
};

export default CreateAccessoryPage;
