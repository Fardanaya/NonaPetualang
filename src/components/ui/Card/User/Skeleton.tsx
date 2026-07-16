import { Section } from "../../Section";
import { Skeleton } from "../../heroui";

const SkeletonUserCard = () => {
  return (
    <Section className="flex flex-col gap-2 px-3 py-2">
      <div className="flex flex-row items-center gap-2 color-primary">
        <div className="relative size-[60px] aspect-square">
          <Skeleton className="rounded-full aspect-square" />
        </div>
        <div className="flex flex-col  gap-1 w-full">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-2/3" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center gap-1">
                <Skeleton className="h-2 w-full" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default SkeletonUserCard;
