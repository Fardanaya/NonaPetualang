import { ICostumeAttribute } from '../types/catalog';

export const costumeStatus: ICostumeAttribute[] = [
    { key: "soon", label: "Coming Soon" },
    { key: "ready", label: "Ready" },
];

export const costumeSize: ICostumeAttribute[] = [
    { key: "xs", label: "XS" },
    { key: "s", label: "S" },
    { key: "m", label: "M" },
    { key: "l", label: "L" },
    { key: "xl", label: "XL" },
    { key: "xxl", label: "XXL" },
];

export const costumeGender: ICostumeAttribute[] = [
    { key: "male", label: "Male" },
    { key: "female", label: "Female" },
    { key: "unisex", label: "Unisex" },
];
