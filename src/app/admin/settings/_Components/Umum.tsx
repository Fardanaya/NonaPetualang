"use client";

import { Button } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import { BiSolidMegaphone } from "react-icons/bi";
import TextEditor from "@/components/ui/TextEditor";
import SkeletonAnnouncement from "@/components/ui/Skeleton/AnnouncementAdmin/SkeletonAnnouncement";
import { useState, useEffect } from "react";
import { useSettingByKey, useUpdateSetting } from "@/hooks/react-query/settings";
import { ISetting } from "@/lib/types/schemas/setting";

const Umum = () => {
  // Fetch settings
  const { data: announcementData, isLoading: loadingAnnouncement } = useSettingByKey("announcement");
  const { data: termsData, isLoading: loadingTerms } = useSettingByKey("terms");
  const updateMutation = useUpdateSetting();

  // Local state for editing
  const [announcement, setAnnouncement] = useState<ISetting>({
    key: "announcement",
    value: "",
    visible: false,
  });
  const [terms, setTerms] = useState<ISetting>({
    key: "terms",
    value: "",
    visible: false,
  });

  // Sync local state with fetched data
  useEffect(() => {
    if (announcementData) {
      setAnnouncement(announcementData);
    }
  }, [announcementData]);

  useEffect(() => {
    if (termsData) {
      setTerms(termsData);
    }
  }, [termsData]);

  const handleSaveAnnouncement = () => {
    updateMutation.mutate(announcement);
  };

  const handleToggleAnnouncement = () => {
    const updated = { ...announcement, visible: !announcement.visible };
    setAnnouncement(updated);
    updateMutation.mutate(updated);
  };

  const handleSaveTerms = () => {
    updateMutation.mutate(terms);
  };

  const handleToggleTerms = () => {
    const updated = { ...terms, visible: !terms.visible };
    setTerms(updated);
    updateMutation.mutate(updated);
  };

  return (
    <div className="grid grid-wrap grid-cols-1 md:grid-cols-2 gap-4">
      <Section className="px-4 py-3 flex flex-col gap-2">
        {loadingAnnouncement ? (
          <SkeletonAnnouncement />
        ) : (
          <>
            <div className="flex items-center gap-2 p-2 text-white bg-primary rounded-lg">
              <BiSolidMegaphone />
              <p className="font-medium text-sm">Pengumuman</p>
            </div>
            <div className="flex flex-col gap-2">
              <TextEditor
                value={announcement.value ?? ""}
                onValueChange={(e) => {
                  setAnnouncement({ ...announcement, value: e });
                }}
              />
              <div className="flex justify-between">
                <Button
                  color={announcement.visible ? "danger" : "primary"}
                  onPress={handleToggleAnnouncement}
                  isLoading={updateMutation.isPending}
                >
                  {announcement.visible ? "Nonaktifkan" : "Aktifkan"}
                </Button>
                <Button
                  color="primary"
                  onPress={handleSaveAnnouncement}
                  isLoading={updateMutation.isPending}
                >
                  Simpan
                </Button>
              </div>
            </div>
          </>
        )}
      </Section>

      <Section className="px-4 py-3 flex flex-col gap-2">
        {loadingTerms ? (
          <SkeletonAnnouncement />
        ) : (
          <>
            <div className="flex items-center gap-2 p-2 text-white bg-primary rounded-lg">
              <BiSolidMegaphone />
              <p className="font-medium text-sm">Syarat dan Ketentuan</p>
            </div>
            <div className="flex flex-col gap-2">
              <TextEditor
                value={terms.value ?? ""}
                onValueChange={(e) => {
                  setTerms({ ...terms, value: e });
                }}
              />
              <div className="flex justify-between">
                <Button
                  color={terms.visible ? "danger" : "primary"}
                  onPress={handleToggleTerms}
                  isLoading={updateMutation.isPending}
                >
                  {terms.visible ? "Nonaktifkan" : "Aktifkan"}
                </Button>
                <Button
                  color="primary"
                  onPress={handleSaveTerms}
                  isLoading={updateMutation.isPending}
                >
                  Simpan
                </Button>
              </div>
            </div>
          </>
        )}
      </Section>
    </div>
  );
};

export default Umum;
