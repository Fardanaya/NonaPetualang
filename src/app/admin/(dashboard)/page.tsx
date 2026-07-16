"use client";

import { useState } from "react";
import { Select } from "@/components/ui/heroui";
import { SelectItem } from "@heroui/react";
import Schedule from "./_Components/Schedule";
import Statistics from "./_Components/Statistics";

const viewOptions = [
  { key: "schedule", label: "Jadwal" },
  { key: "statistics", label: "Statistik" },
];

const Page = () => {
  const [selectedView, setSelectedView] = useState("schedule");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Select
          className="max-w-[200px]"
          disallowEmptySelection
          defaultSelectedKeys={["schedule"]}
          onChange={(e) => setSelectedView(e.target.value)}
          aria-label="Pilih tampilan dashboard"
        >
          {viewOptions.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>

      {selectedView === "schedule" && <Schedule />}
      {selectedView === "statistics" && <Statistics />}
    </div>
  );
};

export default Page;
