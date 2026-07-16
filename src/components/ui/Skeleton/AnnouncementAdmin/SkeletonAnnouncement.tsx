import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/heroui";

const SkeletonAnnouncement = () => {
  return (
    <Section className="flex flex-col gap-2 px-3 py-2">
      {/* Teks Pengumuman */}
      <div className="flex flex-row gap-4 items-start">
        <Skeleton className="h-5 w-1/3" />
      </div>

    {/* Isi pengumuman */}
      <div className="flex flex-col gap-2 items-start" >
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>

    {/* Content */}
    <div className="flex flex-row gap-4 items-start">
      <Skeleton className="h-[400px] w-full" />
    </div>

    <div className="flex flex-row justify-between items-center">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-8 w-1/3" />
    </div>
    </Section>
  );
};

export default SkeletonAnnouncement;
