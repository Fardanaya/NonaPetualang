import { IUser } from "@/lib/types/schemas/user";
import { Avatar, Badge } from "@heroui/react";
import { FaWhatsapp } from "react-icons/fa6";
import { BiSolidPhoneCall } from "react-icons/bi";
import { Section } from "../../Section";
import { useEffect, useState } from "react";
import { fetchInstagram } from "@/lib/fetch";

const UserCard = ({ item }: { item: IUser }) => {
  return (
    <Section className="flex flex-col gap-2 px-3 py-2">
      <div className="flex flex-row items-center gap-2 color-primary">
        <div className="relative size-[60px] aspect-square">
          <Badge
            isInvisible={!item.is_admin}
            color="primary"
            content="ADMIN"
            placement="bottom-left"
            classNames={{
              badge:
                "border-0 left-[28px] bottom-1.5 text-[0.5rem] text-white font-semibold",
            }}
          >
            <Avatar
              radius="full"
              src={item.identity_pict || "/placeholder.jpeg"}
              size="lg"
              alt={item.name || "user"}
            />
          </Badge>
        </div>
        <div className="flex flex-col w-full">
          <div className="flex flex-col">
            <p className="text-[0.7rem] md:text-sm font-medium">
              {item.full_name || "[ Belum Mengisi Nama Lengkap ]"}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <p className="text-primary">{item?.email}</p>
              <p>•</p>
              <p>{item?.name}</p>
            </div>{" "}
          </div>
          <div className="flex flex-col text-[0.65rem] md:text-xs">
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center gap-1">
                <FaWhatsapp />
                <p>{item.phone_whatsapp || "???"}</p>
              </div>
              <div className="flex items-center gap-1">
                <BiSolidPhoneCall />
                <p>{item.emergency_contact || "???"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default UserCard;
