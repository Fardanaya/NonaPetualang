import { Button } from "@/components/ui/heroui";
import {
  TbLayoutSidebarLeftExpandFilled,
  TbLayoutSidebarLeftCollapseFilled,
} from "react-icons/tb";
import EngageSpotNotification from "@/components/ui/Notification";
import Image from "next/image";
import { metadataConfig } from "@/app/config";

const SidebarNavbar = ({
  collapsed,
  toggled,
  broken,
  setCollapsed,
  setToggled,
}: {
  collapsed: boolean;
  toggled: boolean;
  broken: boolean;
  setCollapsed: () => void;
  setToggled: () => void;
}) => {
  return (
    <div className="flex flex-row justify-between bg-default-200 p-2">
      <div className="flex flex-row gap-2">
        {!broken && (
          <Button variant="light" isIconOnly onPress={setCollapsed}>
            {collapsed ? (
              <TbLayoutSidebarLeftExpandFilled size={20} />
            ) : (
              <TbLayoutSidebarLeftCollapseFilled size={20} />
            )}
          </Button>
        )}
        {broken && (
          <Button variant="light" isIconOnly onPress={setToggled}>
            {toggled ? (
              <TbLayoutSidebarLeftCollapseFilled size={20} />
            ) : (
              <TbLayoutSidebarLeftExpandFilled size={20} />
            )}
          </Button>
        )}

        {!toggled && (
          <div className="flex flex-row items-center gap-2 md:hidden">
            <Image
              src={"/logo.jpg"}
              alt="logo"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div className="flex flex-col">
              <p className="font-bold text-[0.7rem] tracking-wide uppercase text-primary">
                {metadataConfig.name}
              </p>
              <p className="font-medium text-[0.6rem] text-default-800">
                {metadataConfig.publisher.name}
              </p>
            </div>
          </div>
        )}
      </div>
      <EngageSpotNotification />
    </div>
  );
};

export default SidebarNavbar;
