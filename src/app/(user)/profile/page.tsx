"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DiscordTabs from "@/components/ui/DiscordTabs";
import HistoryPage from "./_Components/History";
import AccountPage from "./_Components/Account";
import AddressPage from "./_Components/Address";
import SewaPage from "./_Components/Sewa";
import WishlistPage from "./_Components/Wishlist";
import { FaBox, FaHeart, FaHistory, FaUser, FaMapMarkerAlt } from "react-icons/fa";

const tabs = [
  {
    key: "account",
    label: "Account",
    icon: <FaUser />,
    content: <AccountPage />,
  },
  {
    key: "address",
    label: "Address",
    icon: <FaMapMarkerAlt />,
    content: <AddressPage />,
  },
  {
    key: "sewa",
    label: "Sewa",
    icon: <FaBox />,
    content: <SewaPage />,
  },
  {
    key: "wishlist",
    label: "Wishlist",
    icon: <FaHeart />,
    content: <WishlistPage />,
  },
  {
    key: "history",
    label: "History",
    icon: <FaHistory />,
    content: <HistoryPage />,
  },
];

const ProfilContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") || "account";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Update URL without reload
    router.push(`/profile?tab=${key}`, { scroll: false });
  };

  return (
    <DiscordTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
};

const ProfilPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilContent />
    </Suspense>
  );
};

export default ProfilPage;
