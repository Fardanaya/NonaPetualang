"use client";

import { useState } from "react";
import { Input, Button, Skeleton } from "@/components/ui/heroui";
import { InputLabel } from "@/components/ui/Input";
import { Progress } from "@heroui/react";
import { LuImageUp, LuImageOff } from "react-icons/lu";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import Image from "next/image";
import { displayToast, validateFileSize } from "@/lib/utils";
import { useCreateOrUpdateUser } from "@/hooks/react-query/user";
import type { ProfileFormData } from "../page";

interface PersonalDataStepProps {
  formData: ProfileFormData;
  updateFormData: (data: Partial<ProfileFormData>) => void;
  userId?: string;
}

const PersonalDataStep = ({
  formData,
  updateFormData,
  userId,
}: PersonalDataStepProps) => {
  const createOrUpdateUser = useCreateOrUpdateUser();
  const [uploadingIdentity, setUploadingIdentity] = useState(false);

  const handleImageUploadWithProgress = async (
    file: File,
    id: string | undefined,
    forType = "profile"
  ): Promise<string | null> => {
    if (!validateFileSize(file, 2)) return null;
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("type", forType);
      if (id) formData.append("id", id);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/tools/image");
        xhr.withCredentials = true;
        xhr.addEventListener("load", () => {
          try {
            const uploadData = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              if (uploadData.success) {
                resolve(uploadData.results[0].url);
              } else {
                reject(new Error(uploadData.error || "Image upload failed"));
              }
            } else {
              reject(new Error(uploadData.error || "Image upload failed"));
            }
          } catch (error) {
            reject(new Error("Failed to parse upload response"));
          }
        });
        xhr.addEventListener("error", () => {
          reject(new Error("Image upload failed"));
        });
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Upload error:", error);
      displayToast({
        type: "danger",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Image upload failed",
      });
      return null;
    }
  };

  const uploadSingleImage = async (file: File, type: "ktp") => {
    if (!validateFileSize(file, 2)) return;
    if (type === "ktp") setUploadingIdentity(true);

    try {
      const url = await handleImageUploadWithProgress(file, userId, "profile");
      if (!url) throw new Error("Image upload failed");

      const fieldName = "identity_pict";
      updateFormData({ [fieldName]: url });

      // Persist change to server
      try {
        await createOrUpdateUser.mutateAsync({
          id: userId,
          [fieldName]: url,
        });
      } catch (err) {
        console.error("Failed to persist profile image change:", err);
      }

      displayToast({
        type: "success",
        title: "Berhasil",
        description: "KTP/Kartu Pelajar berhasil diupload",
      });
    } catch (error) {
      console.error("Upload failed:", error);
      displayToast({
        type: "danger",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Image upload failed",
      });
    } finally {
      if (type === "ktp") setUploadingIdentity(false);
    }
  };

  const handleFileChange = async (file: File, type: "ktp") => {
    await uploadSingleImage(file, type);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold">1</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Data Pribadi</h2>
          <p className="text-sm text-default-500">
            Lengkapi informasi dasar Anda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Nama Lengkap */}
        <Input
          type="text"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          value={formData.full_name}
          onValueChange={(value) => updateFormData({ full_name: value })}
          isRequired
        />

        {/* No HP */}
        <Input
          type="tel"
          label="No HP / WhatsApp"
          placeholder="Contoh: 08123456789"
          value={formData.phone_whatsapp}
          onValueChange={(value) => updateFormData({ phone_whatsapp: value })}
          isRequired
        />

        {/* Emergency Contact */}
        <Input
          type="tel"
          label="Emergency Contact"
          placeholder="Nomor keluarga/teman yang bisa dihubungi"
          description="Nomor orang tua/saudara/teman yang bisa dihubungi jika darurat"
          value={formData.emergency_contact}
          onValueChange={(value) => updateFormData({ emergency_contact: value })}
          isRequired
        />
      </div>

      {/* Document Upload Section */}
      <div className="flex flex-col gap-4 mt-4">
        <InputLabel
          label="Dokumen Identitas"
          desc="Upload foto KTP/Kartu Pelajar"
        />
        <div className="grid grid-cols-1 gap-4 p-4 border border-primary/30 rounded-lg bg-default-50">
          {/* KTP Upload */}
          <div className="flex flex-col gap-2">
            <InputLabel label="KTP / Kartu Pelajar" />
            <div className="w-full flex justify-center">
              {formData.identity_pict ? (
                <div className="relative flex justify-center items-center gap-2 h-48 w-full rounded-lg bg-default-200 hover:bg-primary/10 transition">
                  <RiVerifiedBadgeFill className="text-success" size={24} />
                  <p className="text-sm font-medium">Berhasil diupload</p>
                </div>
              ) : (
                <div className="relative flex justify-center items-center h-48 w-full rounded-lg bg-default-100 hover:bg-primary/5 transition border-dashed border-2 border-primary/50">
                  <div className="absolute flex flex-col justify-center items-center gap-2 w-full h-full top-0 left-0 z-10 pointer-events-none">
                    {uploadingIdentity ? (
                      <div className="flex flex-col justify-center items-center gap-2 w-1/2">
                        <LuImageUp className="text-primary" size={40} />
                        <Progress
                          color="primary"
                          radius="sm"
                          size="sm"
                          isIndeterminate
                        />
                        <p className="text-xs text-default-500">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <LuImageOff className="text-primary/60" size={40} />
                        <p className="text-sm text-center text-default-500">
                          Klik untuk upload
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingIdentity}
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleFileChange(e.target.files[0], "ktp")
                    }
                    className="h-full w-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      <div className="bg-default-50 rounded-lg p-4 mt-2">
        <p className="text-sm font-medium mb-2">Checklist:</p>
        <ul className="text-sm space-y-1">
          <li className={formData.full_name ? "text-success" : "text-default-400"}>
            {formData.full_name ? "✓" : "○"} Nama Lengkap
          </li>
          <li className={formData.phone_whatsapp ? "text-success" : "text-default-400"}>
            {formData.phone_whatsapp ? "✓" : "○"} No HP / WhatsApp
          </li>
          <li className={formData.emergency_contact ? "text-success" : "text-default-400"}>
            {formData.emergency_contact ? "✓" : "○"} Emergency Contact
          </li>
          <li className={formData.identity_pict ? "text-success" : "text-default-400"}>
            {formData.identity_pict ? "✓" : "○"} Foto KTP / Kartu Pelajar
          </li>

        </ul>
      </div>
    </div>
  );
};

export default PersonalDataStep;
