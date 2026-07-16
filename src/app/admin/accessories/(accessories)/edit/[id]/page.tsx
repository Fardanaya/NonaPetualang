"use client";

import { useParams } from "next/navigation";
import AccessoryForm from "../../../_Components/AccessoryForm";

const EditAccessoryPage = () => {
  const { id } = useParams();

  return <AccessoryForm mode="edit" accessoryId={id as string} />;
};

export default EditAccessoryPage;
