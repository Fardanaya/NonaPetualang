"use client";

import { HeroUIProvider } from "@heroui/react";

const HeroUIProviders = ({ children }: { children: React.ReactNode }) => {
  return <HeroUIProvider>{children}</HeroUIProvider>;
};

export default HeroUIProviders;
