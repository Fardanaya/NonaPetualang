import { Avatar } from "@heroui/react";
import { Button } from "../../heroui";
import { HiExternalLink } from "react-icons/hi";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa6";

const InstagramCard = ({ instagram }: { instagram: any }) => {
  return (
    <div className="flex items-center gap-4">
      <Avatar
        src={instagram?.profile_pic_url_hd_cached || "/placeholder.jpeg"}
        alt="user"
        className="size-10"
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <FaInstagram />
          <p className="font-medium leading-none">
            {instagram?.username || "Instagram"}
          </p>
          {instagram?.username && (
            <Button
              isIconOnly
              size="xs"
              variant="light"
              as={Link}
              target="_blank"
              href={`https://instagram.com/${instagram?.username}`}
            >
              <HiExternalLink />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p>
            <span className="font-semibold text-primary text-xs">
              {instagram?.media_count || 0}
            </span>
            &nbsp;
            <span className="text-[0.6rem]">Post</span>
          </p>
          <p>
            <span className="font-semibold text-primary text-xs">
              {instagram?.following_count || 0}
            </span>
            &nbsp;
            <span className="text-[0.6rem]">Following</span>
          </p>
          <p>
            <span className="font-semibold text-primary text-xs">
              {instagram?.follower_count || 0}
            </span>
            &nbsp;
            <span className="text-[0.6rem]">Followers</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstagramCard;
