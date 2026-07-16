import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    plugins: [heroui({
        "themes": {
            "light": {
                "colors": {
                    "default": {
                        "50": "#fafafa",
                        "100": "#f2f2f3",
                        "200": "#ebebec",
                        "300": "#e3e3e6",
                        "400": "#dcdcdf",
                        "500": "#d4d4d8",
                        "600": "#afafb2",
                        "700": "#8a8a8c",
                        "800": "#656567",
                        "900": "#404041",
                        "foreground": "#000",
                        "DEFAULT": "#d4d4d8"
                    },
                    "primary": {
                        "50": "#fefce8",
                        "100": "#fef9c3",
                        "200": "#fef08a",
                        "300": "#fde047",
                        "400": "#facc15",
                        "500": "#eab308",
                        "600": "#ca8a04",
                        "700": "#a16207",
                        "800": "#854d0e",
                        "900": "#713f12",
                        "foreground": "#000",
                        "DEFAULT": "#facc15"
                    },
                    "secondary": {
                        "50": "#f2f6fc",
                        "100": "#dfeaf8",
                        "200": "#ccddf4",
                        "300": "#b9d1f0",
                        "400": "#a7c4ec",
                        "500": "#94b8e8",
                        "600": "#7a98bf",
                        "700": "#607897",
                        "800": "#46576e",
                        "900": "#2c3746",
                        "foreground": "#000",
                        "DEFAULT": "#94b8e8"
                    },
                    "success": {
                        "50": "#dff0e6",
                        "100": "#b3dac4",
                        "200": "#86c5a1",
                        "300": "#59af7e",
                        "400": "#2d9a5c",
                        "500": "#008439",
                        "600": "#006d2f",
                        "700": "#005625",
                        "800": "#003f1b",
                        "900": "#002811",
                        "foreground": "#fff",
                        "DEFAULT": "#008439"
                    },
                    "warning": {
                        "50": "#fdf1df",
                        "100": "#f9deb3",
                        "200": "#f6cb86",
                        "300": "#f3b859",
                        "400": "#efa52d",
                        "500": "#ec9200",
                        "600": "#c37800",
                        "700": "#995f00",
                        "800": "#704500",
                        "900": "#472c00",
                        "foreground": "#000",
                        "DEFAULT": "#ec9200"
                    },
                    "danger": {
                        "50": "#f9dfdf",
                        "100": "#f0b3b3",
                        "200": "#e78686",
                        "300": "#de5959",
                        "400": "#d52d2d",
                        "500": "#cc0000",
                        "600": "#a80000",
                        "700": "#850000",
                        "800": "#610000",
                        "900": "#3d0000",
                        "foreground": "#fff",
                        "DEFAULT": "#cc0000"
                    },
                    "background": "#ffffff",
                    "foreground": {
                        "50": "#dfdfdf",
                        "100": "#b3b3b3",
                        "200": "#868686",
                        "300": "#595959",
                        "400": "#2d2d2d",
                        "500": "#000000",
                        "600": "#000000",
                        "700": "#000000",
                        "800": "#000000",
                        "900": "#000000",
                        "foreground": "#fff",
                        "DEFAULT": "#000000"
                    },
                    "content1": {
                        "DEFAULT": "#ffffff",
                        "foreground": "#000"
                    },
                    "content2": {
                        "DEFAULT": "#f4f4f5",
                        "foreground": "#000"
                    },
                    "content3": {
                        "DEFAULT": "#e4e4e7",
                        "foreground": "#000"
                    },
                    "content4": {
                        "DEFAULT": "#d4d4d8",
                        "foreground": "#000"
                    },
                    "focus": "#32609b",
                    "overlay": "#000000",
                    "divider": "#111111"
                }
            },
            "dark": {
                "colors": {
                    "default": {
                        "50": "#131315",
                        "100": "#1e1e21",
                        "200": "#29292e",
                        "300": "#34343a",
                        "400": "#3f3f46",
                        "500": "#616166",
                        "600": "#828287",
                        "700": "#a4a4a7",
                        "800": "#c5c5c8",
                        "900": "#e7e7e8",
                        "foreground": "#fff",
                        "DEFAULT": "#3f3f46"
                    },
                    "primary": {
                        "50": "#713f12",
                        "100": "#854d0e",
                        "200": "#a16207",
                        "300": "#ca8a04",
                        "400": "#eab308",
                        "500": "#facc15",
                        "600": "#fde047",
                        "700": "#fef08a",
                        "800": "#fef9c3",
                        "900": "#fefce8",
                        "foreground": "#000",
                        "DEFAULT": "#facc15"
                    },
                    "secondary": {
                        "50": "#2c3746",
                        "100": "#46576e",
                        "200": "#607897",
                        "300": "#7a98bf",
                        "400": "#94b8e8",
                        "500": "#a7c4ec",
                        "600": "#b9d1f0",
                        "700": "#ccddf4",
                        "800": "#dfeaf8",
                        "900": "#f2f6fc",
                        "foreground": "#000",
                        "DEFAULT": "#94b8e8"
                    },
                    "success": {
                        "50": "#002811",
                        "100": "#003f1b",
                        "200": "#005625",
                        "300": "#006d2f",
                        "400": "#008439",
                        "500": "#2d9a5c",
                        "600": "#59af7e",
                        "700": "#86c5a1",
                        "800": "#b3dac4",
                        "900": "#dff0e6",
                        "foreground": "#fff",
                        "DEFAULT": "#008439"
                    },
                    "warning": {
                        "50": "#472c00",
                        "100": "#704500",
                        "200": "#995f00",
                        "300": "#c37800",
                        "400": "#ec9200",
                        "500": "#efa52d",
                        "600": "#f3b859",
                        "700": "#f6cb86",
                        "800": "#f9deb3",
                        "900": "#fdf1df",
                        "foreground": "#000",
                        "DEFAULT": "#ec9200"
                    },
                    "danger": {
                        "50": "#3d0000",
                        "100": "#610000",
                        "200": "#850000",
                        "300": "#a80000",
                        "400": "#cc0000",
                        "500": "#d52d2d",
                        "600": "#de5959",
                        "700": "#e78686",
                        "800": "#f0b3b3",
                        "900": "#f9dfdf",
                        "foreground": "#fff",
                        "DEFAULT": "#cc0000"
                    },
                    "background": "#000000",
                    "foreground": {
                        "50": "#4d4d4d",
                        "100": "#797979",
                        "200": "#a6a6a6",
                        "300": "#d2d2d2",
                        "400": "#ffffff",
                        "500": "#ffffff",
                        "600": "#ffffff",
                        "700": "#ffffff",
                        "800": "#ffffff",
                        "900": "#ffffff",
                        "foreground": "#000",
                        "DEFAULT": "#ffffff"
                    },
                    "content1": {
                        "DEFAULT": "#18181b",
                        "foreground": "#fff"
                    },
                    "content2": {
                        "DEFAULT": "#27272a",
                        "foreground": "#fff"
                    },
                    "content3": {
                        "DEFAULT": "#3f3f46",
                        "foreground": "#fff"
                    },
                    "content4": {
                        "DEFAULT": "#52525b",
                        "foreground": "#fff"
                    },
                    "focus": "#32609b",
                    "overlay": "#ffffff",
                    "divider": "#ffffff"
                }
            }
        },
    }),
        // require("tailwindcss-animate")
    ],
};

export default config;