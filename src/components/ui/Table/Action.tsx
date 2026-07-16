"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { Button } from "../heroui";
import { FaPen, FaTrash } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";

const TableAction = ({
  onUpdate,
  onDelete,
}: {
  onUpdate: () => void;
  onDelete: () => void;
}) => {
  return (
    <Dropdown showArrow>
      <DropdownTrigger>
        <Button isIconOnly size="sm">
          <HiDotsVertical />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="update" startContent={<FaPen />} onPress={onUpdate}>
          Edit
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          closeOnSelect={false}
        >
          <Popover placement="right">
            <PopoverTrigger>
              <div className="flex flex-row items-center gap-2">
                <FaTrash /> Delete
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-1 flex flex-row items-center gap-4">
                <div className="flex flex-col w-full">
                  <p className="text-sm font-bold">Apakah Anda yakin ?</p>
                  <p className="text-xs">Data akan dihapus secara permanen</p>
                </div>
                <div>
                  <Button
                    startContent={<FaTrash />}
                    color="danger"
                    size="sm"
                    onPress={onDelete}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default TableAction;
