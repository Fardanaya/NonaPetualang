"use client";

import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  useUserById,
  useToggleBlacklist,
  useToggleAdmin,
} from "@/hooks/react-query/user";
import { useAddress } from "@/hooks/react-query/address";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tabs,
  Tab,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { Button, Chip, Modal, Pagination } from "@/components/ui/heroui";
import { FaLocationDot, FaWhatsapp } from "react-icons/fa6";
import { IoCall } from "react-icons/io5";
import Link from "next/link";
import { FaCheckCircle, FaTimesCircle, FaFileAlt, FaBan } from "react-icons/fa";
import {
  usePaginatedTransactions,
  useUserTransactions,
} from "@/hooks/react-query/transaction";
import { useRouter } from "next/navigation";
import SkeletonOrderCard from "@/components/ui/Card/Order/Skeleton";
import { FaHistory } from "react-icons/fa";
import { useSimplePagination } from "@/hooks/pagination";
import AdminOrderCard from "@/components/ui/Card/Order/AdminOrderCard";
import { List } from "lucide-react";

const UserDetailPage = () => {
  const { id } = useParams();
  const [blacklistReason, setBlacklistReason] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isBlacklistOpen,
    onOpen: onBlacklistOpen,
    onOpenChange: onBlacklistOpenChange,
  } = useDisclosure();
  const {
    isOpen: isAdminOpen,
    onOpen: onAdminOpen,
    onOpenChange: onAdminOpenChange,
  } = useDisclosure();

  const { data: userData, isLoading: userLoading } = useUserById(id as string);
  const { data: addressData, isLoading: addressLoading } = useAddress({
    user_id: id as string,
  });

  const router = useRouter();
  const toggleBlacklist = useToggleBlacklist();
  const toggleAdmin = useToggleAdmin();

  const {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    pageSize,
    setPageSize,
    debouncedSearch,
  } = useSimplePagination({ initialPageSize: 8 });

  // Use paginated users hook with server-side pagination
  const { data, error, isLoading } = usePaginatedTransactions({
    page,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    userId: id as string,
  });

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <Section className="flex flex-col w-full md:max-w-[40%] gap-3 md:gap-4">
        <div className="flex flex-col">
          <div className="relative">
            <div className="relative w-full min-h-[120px] md:min-h-[160px] rounded-lg overflow-hidden">
              <Image
                src="/404-bg.jpg"
                alt="..."
                fill
                className={`object-cover`}
              />
            </div>
            <div className="absolute bottom-[-20px] md:bottom-[-25px] left-[5%] z-2">
              <Avatar
                src={"/placeholder.jpeg"}
                alt="user"
                className="size-[80px] md:size-[100px] shadow-2xl"
                classNames={{ img: "" }}
              />
            </div>
            <div className="absolute right-0 bottom-0 z-10 p-2">
              {userData?.is_admin && (
                <Chip
                  color="primary"
                  radius="full"
                  classNames={{
                    content:
                      "text-white font-semibold uppercase shadow-xl px-1.5",
                  }}
                >
                  Admin
                </Chip>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex flex-col">
            <p className="font-semibold">
              {userData?.full_name ?? "Nama Lengkap"}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Link href={`mailto:${userData?.email}`} className="text-primary">
                {userData?.email}
              </Link>
              <p>•</p>
              <p>{userData?.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2 md:gap-2">
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
              <Dropdown showArrow>
                <DropdownTrigger>
                  <Button
                    size="sm"
                    startContent={<FaWhatsapp className="font-medium" />}
                    className="justify-start font-medium"
                  >
                    Contact
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem
                    key="whatsapp"
                    startContent={<FaWhatsapp />}
                    href={
                      userData?.phone_whatsapp
                        ? `https://wa.me/${userData?.phone_whatsapp}`
                        : "#"
                    }
                  >
                    Whatsapp
                  </DropdownItem>
                  <DropdownItem
                    key="phone"
                    startContent={<IoCall />}
                    href={
                      userData?.phone_whatsapp
                        ? `tel:${userData?.phone_whatsapp}`
                        : "#"
                    }
                  >
                    Phone
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Dropdown showArrow>
                <DropdownTrigger>
                  <Button
                    size="sm"
                    startContent={<FaWhatsapp className="font-medium" />}
                    className="justify-start font-medium"
                  >
                    Emergency
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem
                    key="whatsapp"
                    startContent={<FaWhatsapp />}
                    href={
                      userData?.emergency_contact
                        ? `https://wa.me/${userData?.emergency_contact}`
                        : "#"
                    }
                  >
                    Whatsapp
                  </DropdownItem>
                  <DropdownItem
                    key="phone"
                    startContent={<IoCall />}
                    href={
                      userData?.emergency_contact
                        ? `tel:${userData?.emergency_contact}`
                        : "#"
                    }
                  >
                    Phone
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 text-xs">
              <FaLocationDot />
              <p className="font-semibold">Alamat</p>
            </div>
            {addressData?.length === 0 ? (
              <p>Tidak ada alamat</p>
            ) : (
              <Accordion
                variant="bordered"
                className="border-1 border-default-400 rounded-lg px-0 overflow-hidden"
                showDivider={false}
              >
                {(addressData || []).map((item: any, index: number) => (
                  <AccordionItem
                    key={index}
                    startContent={<div>{item.label}</div>}
                    classNames={{
                      trigger:
                        "py-2 px-4 text-sm cursor-pointer hover:bg-white/10 transition-all",
                      content: "pt-0 px-4 text-xs",
                    }}
                  >
                    <p>{item.address}</p>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 text-xs">
              <FaFileAlt />
              <p className="font-semibold">Berkas</p>
            </div>
            <div className="flex justify-between items-center gap-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs">
                  {userData?.identity_pict ? (
                    <FaCheckCircle className="text-success" />
                  ) : (
                    <FaTimesCircle className="text-danger" />
                  )}
                  <p>Foto KTP</p>
                </div>
              </div>
              <Button
                color="primary"
                startContent={<FaFileAlt />}
                onPress={onOpenChange}
              >
                Lihat Berkas
              </Button>
              <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Berkas Verifikasi -{" "}
                        {userData?.full_name || userData?.name}
                      </ModalHeader>
                      <ModalBody className=" overflow-y-auto">
                        <Tabs aria-label="Berkas Verifikasi" className="w-full">
                          <Tab key="identitas" title="Identitas">
                            <div className="py-4">
                              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                <div>
                                  <h3 className="text-sm font-semibold mb-3 text-center">
                                    Foto KTP
                                  </h3>
                                  {userData?.identity_pict ? (
                                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border">
                                      <Image
                                        src={userData.identity_pict}
                                        alt="Foto KTP"
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-sm text-default-500 text-center">
                                      Belum diupload
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Tab>
                        </Tabs>
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="primary"
                          variant="light"
                          onPress={onClose}
                        >
                          Tutup
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              color={userData?.is_admin ? "warning" : "primary"}
              onPress={onAdminOpen}
            >
              {userData?.is_admin ? "Turunkan Dari Admin" : "Angkat Jadi Admin"}
            </Button>

            <Button color="danger" onPress={onBlacklistOpen}>
              {userData?.is_blacklist
                ? "Remove from Blacklist"
                : "Add to Blacklist"}
            </Button>
          </div>

          {/* Alasan blacklist */}
          {userData?.is_blacklist && (
            <div className="flex flex-col gap-2 p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <div className="flex items-center gap-1 text-xs">
                <FaBan className="text-danger" />
                <p className="font-semibold text-danger">Alasan Blacklist</p>
              </div>
              <p className="text-sm">{userData?.blacklist_reason}</p>
            </div>
          )}

          {/* Blacklist Modal */}
          <Modal isOpen={isBlacklistOpen} onOpenChange={onBlacklistOpenChange}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader>
                    {userData?.is_blacklist
                      ? "Remove from Blacklist"
                      : "Add to Blacklist"}
                  </ModalHeader>
                  <ModalBody>
                    <p className="text-sm text-default-600 mb-4">
                      {userData?.is_blacklist
                        ? "Are you sure you want to remove this user from the blacklist?"
                        : "Please provide a reason for adding this user to the blacklist:"}
                    </p>
                    {!userData?.is_blacklist && (
                      <Textarea
                        placeholder="Why She/He Deserve To Be Blacklisted?"
                        value={blacklistReason}
                        onChange={(e) => setBlacklistReason(e.target.value)}
                      />
                    )}
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button
                      color="danger"
                      onPress={() => {
                        toggleBlacklist.mutate({
                          id: id as string,
                          isBlacklist: !userData?.is_blacklist,
                          reason: userData?.is_blacklist
                            ? undefined
                            : blacklistReason,
                        });
                        setBlacklistReason("");
                        onClose();
                      }}
                      isLoading={toggleBlacklist.isPending}
                    >
                      {userData?.is_blacklist ? "Remove" : "Add to Blacklist"}
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>

          {/* Admin Modal */}
          <Modal isOpen={isAdminOpen} onOpenChange={onAdminOpenChange}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader>
                    {userData?.is_admin
                      ? "Turunkan Dari Admin"
                      : "Angkat Jadi Admin"}
                  </ModalHeader>
                  <ModalBody>
                    <p className="text-sm text-default-600 mb-4">
                      {userData?.is_admin
                        ? "Apakah Anda yakin ingin menurunkan pengguna ini dari status admin?"
                        : "Apakah Anda yakin ingin mengangkat pengguna ini menjadi admin?"}
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      Batal
                    </Button>
                    <Button
                      color={userData?.is_admin ? "warning" : "primary"}
                      onPress={() => {
                        toggleAdmin.mutate({
                          id: id as string,
                          isAdmin: !userData?.is_admin,
                        });
                        onClose();
                      }}
                      isLoading={toggleAdmin.isPending}
                    >
                      {userData?.is_admin ? "Turunkan" : "Angkat"}
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
      </Section>
      <Section className="flex flex-col w-full md:max-w-[60%] gap-2 p-2">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <FaHistory className="text-primary" size={20} />
          <h2 className="text-xl font-semibold">
            History - {userData?.full_name || userData?.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonOrderCard key={idx} />
            ))
          ) : data?.data.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-4">
                <FaHistory className="text-default-300" size={28} />
              </div>
              <p className="text-default-600 font-medium mb-1">
                Belum ada history
              </p>
            </div>
          ) : (
            data?.data.map((item, idx) => (
              <div
                key={idx}
                onClick={() => router.push(`/order/${item.id}`)}
                className="cursor-pointer"
              >
                <AdminOrderCard item={item} />
              </div>
            ))
          )}
          <div className="flex justify-end md:justify-end mt-4 md:col-span-2">
            {(data?.pagination?.totalPages || 0) > 0 && (
              <Pagination
                loop
                showControls
                initialPage={1}
                page={page}
                total={data?.pagination?.totalPages || 0}
                onChange={(newPage) => setPage(newPage)}
              />
            )}
          </div>
        </div>
      </Section>
    </div>
  );
};

export default UserDetailPage;
