import { useRouter } from "next/navigation";
import { FaAngleRight } from "react-icons/fa6";

const Other = ({ href }: { href: string }) => {
  const router = useRouter();

  return (
    <div
      className="group relative flex flex-row items-center justify-center gap-2 cursor-pointer py-3 px-4 md:py-1 md:px-2"
      onClick={() => router.push(href)}
    >
      <p className="hidden md:block text-sm bg-gradient-to-r from-default-900 to-default-900 text-transparent bg-clip-text group-hover:to-primary transition">
        Lihat Selengkapnya
      </p>
      <FaAngleRight className="group-hover:translate-x-1.5 transition group-hover:text-primary" />
    </div>
  );
};

export default Other;
