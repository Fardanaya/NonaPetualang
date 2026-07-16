import {
  extendVariants,
  Select as HeroUISelect,
  Input as HeroUIInput,
  NumberInput as HeroUINumberInput,
  Button as HeroUIButton,
  Chip as HeroUIChip,
  Table as HeroUITable,
  Modal as HeroUIModal,
  Drawer as HeroUIDrawer,
  Autocomplete as HeroUIAutocomplete,
  Pagination as HeroUIPagination,
  DatePicker as HeroUIDatePicker,
  Skeleton as HeroUISkeleton,
} from "@heroui/react";

const Skeleton = extendVariants(HeroUISkeleton, {
  variants: {
    variant: {
      default: {
        base: "rounded",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const DatePicker = extendVariants(HeroUIDatePicker, {
  variants: {},
  defaultVariants: {
    variant: "bordered",
    color: "primary",
    radius: "sm",
    labelPlacement: "outside",
    placeholder: " ",
  },
});

const Drawer = extendVariants(HeroUIDrawer, {
  variants: {
    backdrop: {
      opaque: {
        backdrop: "bg-black/80",
      },
    },
  },
  defaultVariants: {
    backdrop: "opaque",
  },
});

const Modal = extendVariants(HeroUIModal, {
  variants: {
    backdrop: {
      opaque: {
        backdrop: "bg-black/80",
      },
    },
  },
  defaultVariants: {
    backdrop: "opaque",
    placement: "center",
  },
});

const Table = extendVariants(HeroUITable, {
  variants: {
    color: {
      primary: {
        th: "bg-primary text-white",
      },
    },
  },
  defaultVariants: {
    radius: "sm",
  },
});

const NumberInput = extendVariants(HeroUINumberInput, {
  variants: {
    isCenterValue: {
      true: {
        input: "text-center",
      },
    },
  },
  defaultVariants: {
    variant: "bordered",
    color: "primary",
    labelPlacement: "outside",
    placeholder: " ",
    radius: "sm",
    step: "any",
    minValue: 0,
  },
});

const Input = extendVariants(HeroUIInput, {
  variants: {},
  defaultVariants: {
    variant: "bordered",
    color: "primary",
    labelPlacement: "outside",
    placeholder: " ",
    radius: "sm",
    step: "any",
  },
});

const Select = extendVariants(HeroUISelect, {
  variants: {
    isCenterValue: {
      true: {
        value: "text-center",
      },
    },
    size: {
      xs: {
        base: "h-[28px]",
        innerWrapper: "py-0.5",
        value: "text-sm",
      },
    },
  },
  defaultVariants: {
    variant: "bordered",
    color: "primary",
    labelPlacement: "outside",
    placeholder: " ",
    radius: "sm",
  },
});

const Autocomplete = extendVariants(HeroUIAutocomplete, {
  variants: {},
  defaultVariants: {
    variant: "bordered",
    color: "primary",
    labelPlacement: "outside",
    placeholder: " ",
    radius: "sm",
  },
});

const Button = extendVariants(HeroUIButton, {
  variants: {
    color: {
      primary: "text-white",
      danger: "text-white",
    },
    variant: {
      bordered: "text-primary border-primary",
    },
    size: {
      xs: "min-w-6 w-6 h-6 rounded-[4px]",
    },
  },
  defaultVariants: {
    variant: "solid",
    radius: "sm",
  },
});

const Pagination = extendVariants(HeroUIPagination, {
  variants: {
    color: {
      primary: {
        item: "bg-default-50",
        next: "bg-default-50",
        prev: "bg-default-50",
        cursor: "text-white",
      },
    },
  },
  defaultVariants: {
    isCompact: "true",
    variant: "flat",
    color: "primary",
    radius: "sm",
    size: "sm",
  },
});

const Chip = extendVariants(HeroUIChip, {
  variants: {
    type: {
      soon: {
        base: "bg-red-500 text-white",
      },
      popular: {
        base: "bg-blue-500 text-white",
      },
      ready: {
        base: "bg-green-500 text-white",
      },
      size: {
        base: "uppercase",
      },
    },
    payment: {
      paid: {
        base: "bg-success text-white",
        content: "uppercase font-semibold tracking-wide",
      },
      pending: {
        base: "bg-yellow-500 text-white",
        content: "uppercase font-semibold tracking-wide",
      },
      unpaid: {
        base: "bg-danger text-white",
        content: "uppercase font-semibold tracking-wide",
      },
    },
    gender: {
      female: {
        base: "text-primary border-primary",
      },
      male: {
        base: "text-blue-500 border-blue-500",
      },
      unisex: {
        base: "text-gray-500 border-gray-500",
      },
    },
    bundle: {
      yes: {
        base: "border-green-500 text-green-500",
      },
    },
    variant: {
      bordered: {
        base: "border-[1px]",
      },
      shadow: {
        base: "shadow-black/20",
      },
    },
    radius: {
      custom: {
        base: "rounded-[5px]",
      },
    },
    size: {
      xs: {
        base: "text-[0.65rem] md:text-[0.7rem] px-2 py-0",
      },
      xss: {
        base: "text-[0.6rem] md:text-[0.65rem] px-2 py-0",
      },
    },
    color: {
      danger: {
        base: "text-white",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    radius: "custom",
  },
});

const formatWithPeriodGrouping = (value: string | number) => {
  if (value === null || value === undefined || value === "") return "";

  const numberValue = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(numberValue)) return "";

  // Split integer and decimal parts
  const [integerPart, decimalPart] = numberValue.toString().split(".");

  // Format integer part with period as thousands separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Combine with decimal part if exists
  return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
};

export {
  Skeleton,
  Drawer,
  Modal,
  DatePicker,
  Table,
  Input,
  NumberInput,
  Pagination,
  Select,
  Autocomplete,
  Button,
  Chip,
  formatWithPeriodGrouping,
};
