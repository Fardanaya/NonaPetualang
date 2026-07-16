import { Menu } from "react-pro-sidebar";

const SidebarMenu = ({ children }: { children: React.ReactNode }) => {
  return (
    <Menu
      className="select-none"
      menuItemStyles={{
        root: {
          fontSize: "13px",
          fontWeight: 400,
          backgroundColor: "hsla(var(--heroui-default-200))",
        },
        icon: {
          color: "hsla(var(--heroui-foreground))",
        },
        SubMenuExpandIcon: {
          color: "hsla(var(--heroui-foreground))",
        },
        button: {
          "&:hover": {
            backgroundColor: "hsla(var(--heroui-default-300))",
          },
        },
      }}
    >
      {children}
    </Menu>
  );
};

export default SidebarMenu;
