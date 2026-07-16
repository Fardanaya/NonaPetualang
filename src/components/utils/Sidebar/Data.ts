import { LuUsersRound, LuShoppingCart, LuSettings, LuWarehouse, LuServerCog, LuTent, LuBackpack, LuMap, LuTag } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import { TbLayoutDashboard } from "react-icons/tb";
import { FiVideo } from "react-icons/fi";
import { MdOutlineAddToPhotos } from "react-icons/md";
import { RiCoupon2Line } from "react-icons/ri";

export interface SidebarItem {
    label: string;
    href?: string;
    icon: React.ComponentType;
    tooltip?: string;
    submenu?: SidebarItem[]
}


export const sidebarData: SidebarItem[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: TbLayoutDashboard,
        tooltip: "Dashboard"
    },
    {
        label: "Order",
        href: "/admin/order",
        icon: BsBoxSeam,
        tooltip: "Order"
    },
    {
        label: "Catalog",
        icon: LuTent,
        tooltip: "Alat",
        submenu: [
            {
                label: "Single Catalog",
                href: "/admin/catalog",
                icon: LuBackpack,
                tooltip: "Single Catalog"
            },
            {
                label: "Bundle Catalog",
                href: "/admin/catalog/bundle",
                icon: LuMap,
                tooltip: "Bundle Catalog"
            },
        ]
    },
    {
        label: "Warehouse",
        icon: LuWarehouse,
        tooltip: "Warehouse",
        submenu: [
            {
                label: "Addon",
                href: "/admin/warehouse/addon",
                icon: MdOutlineAddToPhotos,
                tooltip: "Addon"
            },
        ]
    },
    {
        label: "Master Data",
        icon: LuServerCog,
        tooltip: "Master Data",
        submenu: [
            {
                label: "Voucher",
                href: "/admin/master/voucher",
                icon: RiCoupon2Line,
                tooltip: "Voucher"
            },
            {
                label: "Category",
                href: "/admin/master/category",
                icon: LuMap,
                tooltip: "Category"
            },
            {
                label: "Brand",
                href: "/admin/master/brand",
                icon: LuTag,
                tooltip: "Brand"
            },
            {
                label: "Tags",
                href: "/admin/master/tag",
                icon: LuTag,
                tooltip: "Tags"
            }
        ]
    },
    {
        label: "User",
        href: "/admin/user",
        icon: LuUsersRound,
        tooltip: "User"
    },
    {
        label: "Settings",
        href: "/admin/settings",
        icon: LuSettings,
        tooltip: "Settings"
    }
];