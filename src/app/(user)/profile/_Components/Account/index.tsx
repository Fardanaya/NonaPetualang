"use client";

import { Button, Input, Modal } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import { fetchInstagram } from "@/lib/fetch";
import { validateFileSize } from "@/lib/utils";
import { useUser, useCreateOrUpdateUser } from "@/hooks/react-query/user";
import {
  Avatar,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";

import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Image from "next/image";

const ProfilPage = () => {
  const { data: user } = useUser();
  const createOrUpdateUser = useCreateOrUpdateUser();
  return (
    <Section className="overflow-hidden p-4 md:p-6">
      {/* Discord-style Profile Header with Banner */}
      <div className="relative mb-20">
        {/* Banner */}
        <div className="h-28 md:h-36 bg-gradient-to-r from-primary via-primary/80 to-secondary relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        </div>
        
        {/* Avatar - Overlapping the banner */}
        <div className="absolute -bottom-12 left-6 md:left-8">
          <div className="relative w-24 h-24 md:w-28 md:h-28">
            <Image
              src={"/placeholder.jpeg"}
              alt={user?.name || "User"}
              className="object-cover rounded-full ring-4 ring-content1"
              fill
            />
          </div>
        </div>
      </div>

        {/* Name Section */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{user?.full_name || user?.name || "User"}</h2>
          <p className="text-default-500 text-sm mt-1">{user?.email || ""}</p>
        </div>

        <div className="h-px bg-default-200 mb-8" />

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* About Me Card */}
          <div className="bg-default-50/50 rounded-xl p-6 border border-default-100">
            <h3 className="text-xs font-bold text-default-500 uppercase tracking-wider mb-5">
              Contact Saya
            </h3>
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-default-400 uppercase">No HP / WhatsApp</span>
                <span className="text-sm font-medium">{user?.phone_whatsapp || "-"}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-default-400 uppercase">Emergency Contact</span>
                <span className="text-sm font-medium">{user?.emergency_contact || "-"}</span>
              </div>
            </div>
          </div>

          {/* Verification Status Card */}
          <div className="bg-default-50/50 rounded-xl p-6 border border-default-100">
            <h3 className="text-xs font-bold text-default-500 uppercase tracking-wider mb-5">
              Status Verifikasi
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {/* KTP Status */}
              <div className={`flex flex-col items-center p-5 rounded-lg border ${user?.identity_pict ? 'bg-success/5 border-success/30' : 'bg-danger/5 border-danger/30'}`}>
                {user?.identity_pict ? (
                  <FaCheckCircle className="text-success mb-2" size={24} />
                ) : (
                  <FaTimesCircle className="text-danger mb-2" size={24} />
                )}
                <span className="text-xs font-medium text-center">Foto KTP</span>
                <span className={`text-[10px] mt-1 ${user?.identity_pict ? 'text-success' : 'text-danger'}`}>
                  {user?.identity_pict ? 'Terverifikasi' : 'Belum'}
                </span>
              </div>
            </div>
          </div>
        </div>
    </Section>
  );
};

export default ProfilPage;
