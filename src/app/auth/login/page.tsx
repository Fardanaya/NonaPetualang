"use client";

import Image from "next/image";
import Link from "next/link";
import Theme from "@/components/utils/Theme";
import { Button } from "@/components/ui/heroui";
import { handleGoogleSignIn } from "@/lib/actions/auth";
import { metadataConfig } from "@/app/config";
import { useState, useEffect } from "react";
import { TiCameraOutline } from "react-icons/ti";
import { motion, AnimatePresence } from "framer-motion";

const loginAssets = [
  {
    src: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=2070",
    quote: "Puncak tidak akan lari, yang penting adalah kembali dengan selamat ke rumah.",
    instagram: "eigeradventure",
  },
  {
    src: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=2070",
    quote: "Alam semesta tidak pernah membatasi petualanganmu, hanya keberanianmu yang menentukannya.",
    instagram: "consina.official",
  },
  {
    src: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80&w=2070",
    quote: "Jelajahi keindahan alam Nusantara dengan perlengkapan yang aman dan terpercaya.",
    instagram: "thenorthface",
  },
  {
    src: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84c?auto=format&fit=crop&q=80&w=2070",
    quote: "Setiap langkah di gunung adalah pelajaran berharga tentang kesabaran dan kerendahan hati.",
    instagram: "ospreypacks",
  }
];

const Page = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex: number) => (prevIndex + 1) % loginAssets.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const currentAsset = loginAssets[currentIndex];

  // Animation variants for Framer Motion
  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const slideVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <>
      <div className="relative h-svh flex flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-white">
        <div className="absolute right-4 top-4 md:right-8 md:top-8 z-50">
          <Theme />
        </div>
        <div className="relative hidden h-full lg:flex flex-col bg-black text-white py-5 pl-6">
          <div className="relative h-full rounded-[2.5rem] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[2] h-full"></div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeVariants}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  fill
                  src={currentAsset.src}
                  alt={currentAsset.instagram}
                  className="absolute inset-0"
                  style={{ objectFit: "cover" }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="absolute bottom-12 left-0 pr-6 pl-12 py-10 flex flex-col justify-end size-full z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full flex flex-col justify-center items-start gap-3 p-8 rounded-[2rem] border border-white/20 bg-black/40 backdrop-blur-md"
              >
                <blockquote>
                  <p className="text-xl font-black italic tracking-tighter uppercase leading-tight">
                    &ldquo;{currentAsset.quote}&rdquo;
                  </p>
                </blockquote>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic text-primary">
                  <TiCameraOutline className="text-lg" />
                  <p>Inspirasi Petualangan</p>
                  <Link
                    target="_blank"
                    className="underline text-white"
                    href={`https://instagram.com/${currentAsset.instagram}`}
                  >
                    @{currentAsset.instagram}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="p-8">
          <div className="mx-auto flex w-full flex-col justify-center items-center space-y-12 sm:w-[450px]">
            <div className="flex flex-col justify-center items-center space-y-6 text-center">
              <div className="relative transform rotate-3">
                <div className="absolute inset-0 bg-primary rounded-3xl blur-2xl opacity-20"></div>
                <Image
                  src="/logo.jpg"
                  alt="Logo"
                  width={150}
                  height={150}
                  className="rounded-[2.5rem] relative z-10 shadow-2xl"
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                  SEWA ALAT PENDAKIAN
                </h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                  Siapkan petualanganmu bersama Nona Petualang
                </p>
              </div>
            </div>
            <div className="flex justify-center w-[80%]">
              <Button
                startContent={
                  <Image
                    src="/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                  />
                }
                fullWidth
                color="primary"
                variant="shadow"
                onPress={() => handleGoogleSignIn()}
              >
                Masuk dengan Google
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Dengan melanjutkan, anda menyetujui{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Persyaratan
              </Link>{" "}
              dan{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Kebijakan
              </Link>{" "}
              kami.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;