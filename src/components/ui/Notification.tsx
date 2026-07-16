"use client";

import { Engagespot } from "@engagespot/react-component";
import { useSession } from "@/components/providers/SessionProvider";
import { FaBell } from "react-icons/fa6";
import { useEffect, useRef } from "react";
import { metadataConfig } from "@/app/config";

import Image from "next/image";

const EngageSpotNotification = () => {
  const { user } = useSession();
  const observerRef = useRef<MutationObserver | null>(null);

  if (!user?.email) {
    return null;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    const modifyEngagespotElements = () => {
      const logoLinks = document.querySelectorAll(
        'a[aria-label="Engagespot Logo"]'
      );

      logoLinks.forEach((logoLink) => {
        if (logoLink.getAttribute("href") === metadataConfig.publisher.url)
          return;

        logoLink.setAttribute("href", metadataConfig.publisher.url);

        const logoText = logoLink.querySelector("h3");
        if (
          logoText &&
          logoText.textContent !==
          `${metadataConfig.company.name} x ${metadataConfig.publisher.name}`
        ) {
          logoText.textContent = `${metadataConfig.company.name} x ${metadataConfig.publisher.name}`;
        }
      });
    };

    modifyEngagespotElements();

    const notificationContainer = document.getElementById(
      "notification-container"
    );
    if (!notificationContainer) return;

    observerRef.current = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length > 0)) {
        modifyEngagespotElements();
      }
    });

    observerRef.current.observe(notificationContainer, {
      childList: true,
      subtree: true,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div id="notification-container">
      <Engagespot
        apiKey={process.env.NEXT_PUBLIC_ENGAGE_SPOT_API_KEY as string}
        dataRegion={
          process.env.NEXT_PUBLIC_ENGAGE_SPOT_DATA_REGION as "eu" | "us"
        }
        userId={user?.email as string}
        renderEmptyPlaceholderImage={() => (
          <div className="relative flex flex-col items-center justify-center gap-4">
            <div className="relative size-[150px]">
              <Image
                src="/logo.jpg"
                alt="404"
                fill
                className="object-cover rounded-xl"
              />
            </div>
            <p className="text-[8rem] font-semibold">Tidak ada notifikasi 🥲</p>
          </div>
        )}
        renderNotificationIcon={() => <FaBell className="text-primary" />}
        theme={{
          notificationButton: {
            iconSize: "1.3rem",
            padding: "0.5rem",
          },
        }}
        textOverrides={{
          header: {
            headerText: "Notifikasi",
            dropdownItems: {
              markAllAsRead: "Semua Sudah Dibaca",
              deleteAll: "Hapus Semua",
            },
          },
          notification: {
            dropdownItems: {
              markAsRead: "Sudah dibaca",
              delete: "Hapus",
            },
          },
        }}
        allowNonHttpsWebPush={true}
      />
    </div>
  );
};

export default EngageSpotNotification;
