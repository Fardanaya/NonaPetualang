"use client";

import { SidebarFooter } from "@/components/utils/Sidebar/Footer";
import { SidebarHeader } from "@/components/utils/Sidebar/Header";
import { useState } from "react";
import { Sidebar } from "react-pro-sidebar";
import { sidebarData } from "@/components/utils/Sidebar/Data";
import { SidebarItem } from "@/components/utils/Sidebar/Item";
import { ScrollShadow } from "@heroui/react";
import { SidebarSubmenu } from "@/components/utils/Sidebar/Submenu";
import SidebarNavbar from "@/components/utils/Sidebar/Navbar";
import SidebarMenu from "@/components/utils/Sidebar/Menu";

const Template = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [toggled, setToggled] = useState(false);
  const [broken, setBroken] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        onBreakPoint={setBroken}
        breakPoint="md"
        backgroundColor="hsla(var(--heroui-default-200))"
        rootStyles={{
          borderColor: "hsla(var(--heroui-default-300))",
        }}
        transitionDuration={1000}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader
            className="sticky top-0 z-10 bg-inherit"
            collapse={collapsed}
          />
          <ScrollShadow className="flex flex-col gap-6 overflow-y-auto flex-1">
            <SidebarMenu>
              {sidebarData.map((item, index) =>
                item.submenu ? (
                  <SidebarSubmenu
                    key={index}
                    item={item}
                    collapsed={collapsed}
                  />
                ) : (
                  <SidebarItem key={index} item={item} collapsed={collapsed} />
                )
              )}
            </SidebarMenu>
          </ScrollShadow>
          <SidebarFooter
            className="sticky bottom-0 z-10 flex px-[20px] pt-[15px] pb-[20px] bg-inherit"
            collapsed={collapsed}
          />
        </div>
      </Sidebar>

      <main className="w-full min-w-0">
        <SidebarNavbar
          collapsed={collapsed}
          toggled={toggled}
          broken={broken}
          setCollapsed={() => setCollapsed(!collapsed)}
          setToggled={() => {
            setToggled(!toggled);
            if (collapsed) setCollapsed(false);
          }}
        />

        <div className="py-4 px-2 md:p-4 overflow-auto h-[calc(100vh-3.5rem)]">
          <div
            // className="content-wrapper"
            id="content"
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Template;
