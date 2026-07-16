"use client";

import { Tabs, Tab } from "@heroui/react";
import Umum from "./_Components/Umum";
// import PaymentAccountPage from "./_Components/Payment";
// import ExpeditionPage from "./_Components/Expedition";

const page = () => {
  return (
    <Tabs
      classNames={{
        tabList: "rounded-[8px]",
        cursor: "rounded-[8px]",
        tabContent:
          "group-data-[selected=true]:text-white text-default-600 font-medium",
        panel: "px-0",
      }}
      color="primary"
      aria-label="Options"
    >
      <Tab key="umum" title="Announcement">
        <Umum />
      </Tab>
      {/* <Tab key="toko" title="Toko"> */}
        {/* <Stats /> */}
      {/* </Tab> */}
      {/* <Tab key="payment" title="Payment">
        <PaymentAccountPage/>
      </Tab> */}
      {/* <Tab key="expedition" title="Expedition">
        <ExpeditionPage />
      </Tab> */}
    </Tabs>
  );
};

export default page;
