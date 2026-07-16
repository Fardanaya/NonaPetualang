"use client";

import { ToastProvider as Toast } from "@heroui/react";

const ToastProvider = () => {
  return (
    <Toast
      placement={"top-right"}
      toastOffset={10}
      toastProps={{
        variant: "solid",
        timeout: 5000,
        classNames: {
          title: "text-white",
          description: "text-white",
          icon: "text-white",
          closeButton: "text-white",
        },
      }}
    />
  );
};

export default ToastProvider;
