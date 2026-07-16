"use client";

import { Radio, cn } from "@heroui/react";

export const AddressRadio = (props: any) => {
    const { children, ...otherProps } = props;

    return (
        <Radio
            {...otherProps}
            classNames={{
                base: cn(
                    "inline-flex max-w-full m-0 bg-content1 hover:bg-content2 items-center justify-between",
                    "cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
                    "data-[selected=true]:border-primary"
                ),
                labelWrapper: "w-full",
                label: "font-semibold text-sm md:text-medium",
            }}
        >
            {children}
        </Radio>
    );
};
