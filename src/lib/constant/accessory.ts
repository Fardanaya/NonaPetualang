import { ICostumeAttribute } from "@/lib/types/catalog";

export const accessoryStatus: ICostumeAttribute[] = [
    { key: "available", label: "Available" },
    { key: "out_of_stock", label: "Out of Stock" },
    { key: "discontinued", label: "Discontinued" },
];

export const accessoryTypes: ICostumeAttribute[] = [
    { key: "accessories", label: "Accessories" },
    { key: "weapon", label: "Weapon" },
    { key: "shoes", label: "Shoes" },
];
