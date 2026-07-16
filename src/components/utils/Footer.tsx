import Link from "next/link";

import { metadataConfig } from "@/app/config";
import { Divider, Image } from "@heroui/react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="flex flex-col justify-center items-center overflow-hidden">
      <Divider className="bg-default-400 h-[0.75px] w-full max-w-7xl" />
      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        <div className="relative flex flex-col items-center w-[250px] pointer-events-none sm:left-[50px]">
          <span
            className="absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] text-5xl font-extrabold select-none leading-none"
            style={{
              WebkitTextStroke: "1px hsl(var(--heroui-default-400))",
              color: "transparent",
            }}
          >
            {metadataConfig.name}
          </span>

          <span
            className="text-3xl sm:text-3xl font-bold tracking-tight text-primary relative leading-none"
            style={{ WebkitTextStroke: "1px hsl(var(--heroui-background))" }}
          >
            {metadataConfig.name}
          </span>
        </div>

        <div className="flex items-center gap-6 text-default-800 text-sm">
          <Link
            target="_blank"
            href={"https://www.instagram.com/nonapetualang/"}
            className="flex flex-row items-center gap-1 hover:scale-110 hover:text-primary transition duration-300"
          >
            <FaInstagram />
            <p>Instagram</p>
          </Link>
          <Link
            target="_blank"
            href={`https://wa.me/?text=Halo kak ${metadataConfig.name}, Mau nanya nih...`}
            className="flex flex-row items-center gap-1 hover:scale-110 hover:text-primary transition duration-300"
          >
            <FaWhatsapp />
            <p>Whatsapp</p>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
