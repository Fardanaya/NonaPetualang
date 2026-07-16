"use client";

import { Button } from "@/components/ui/heroui";
import { useRouter } from "next/navigation";
import { FaAnglesLeft } from "react-icons/fa6";
import Image from "next/image";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div className="relative w-full h-full">
        <Image
          src="/404-bg.jpg"
          alt="bg"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className="absolute w-full h-full bg-black/50"></div>
      </div>
      <div className="absolute top-[25%] sm:top-[30%]">
        <div className="relative flex flex-col w-full h-full">
          <div className="relative">
            <div className="absolute top-[48%] translate-y-[-52%] left-[50%] translate-x-[-50%]">
              <div className="relative flex flex-col justify-center items-center size-[210px] z-10">
                <Image src="/404.png" alt="404" fill className="scale-x-[-1]" />
              </div>
            </div>
            <p className="text-[8rem] sm:text-[12rem] font-bold tracking-widest text-white">
              4&nbsp;&nbsp;4
            </p>
          </div>
          <div className="absolute flex flex-col items-center w-full bottom-[20%] translate-y-full">
            <h1 className="text-xl sm:text-3xl font-bold tracking-wide text-white">
              Oops! Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto text-white">
              Ummm sorry, I got lost and couldn&apos;t find this page.
            </p>
            <div className="pt-4">
              <Button
                variant="shadow"
                color="primary"
                startContent={
                  <FaAnglesLeft className="animate-pulse group-hover:translate-x-[-8px] transition-all duration-300" />
                }
                className="px-8 py-2 font-semibold tracking-wide uppercase text-white"
                onPress={() => router.back()}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
