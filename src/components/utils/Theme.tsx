"use client";

import { Button, Skeleton } from "../ui/heroui";
import { BsMoonStarsFill } from "react-icons/bs";
import { MdWbSunny } from "react-icons/md";
import { useTheme } from "next-themes";

const Theme = ({ onPress }: { onPress?: () => void }) => {
  const { theme, setTheme } = useTheme();

  if (!theme) return <Skeleton className="w-8 h-8" />;

  return (
    <>
      <Button
        variant="light"
        isIconOnly
        radius="sm"
        className="text-primary"
        onPress={
          onPress
            ? onPress
            : () => setTheme(theme === "light" ? "dark" : "light")
        }
      >
        {theme === "light" ? (
          <MdWbSunny size={18} />
        ) : (
          <BsMoonStarsFill size={18} />
        )}
      </Button>
    </>
  );
};

export default Theme;
