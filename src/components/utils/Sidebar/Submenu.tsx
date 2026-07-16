import { Tooltip } from "@heroui/react";
import { menuClasses, SubMenu } from "react-pro-sidebar";
import type { SidebarItem as SidebarItemType } from "./Data";
import { SidebarItem } from "./Item";

interface SidebarItemProps {
  item: SidebarItemType;
  collapsed: boolean;
}

export const SidebarSubmenu = ({ item, collapsed }: SidebarItemProps) => {
  const Icon = item.icon;

  return (
    <Tooltip
      isDisabled={!collapsed}
      className="capitalize"
      content={item.tooltip || item.label}
      radius="sm"
      size="sm"
      placement="right"
      classNames={{
        content: "bg-primary-500 text-white",
      }}
    >
      <SubMenu
        label={item.label}
        icon={<Icon />}
        rootStyles={{
          fontSize: "0.925rem",
          ["." + menuClasses.subMenuContent + ":not(.ps-open)"]: {
            backgroundColor: "transparent",
            borderRadius: "6px",
            boxShadow: "5px 5px 5px 0px rgba(0,0,0,0.4);",
          },
        }}
      >
        {item.submenu?.map((child, index) => (
          <SidebarItem key={index} item={child} collapsed={collapsed} />
        ))}
      </SubMenu>
    </Tooltip>
  );
};
