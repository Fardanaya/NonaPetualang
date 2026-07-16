"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrollShadow } from "@heroui/react";
import { Section } from "@/components/ui/Section";

export interface DiscordTabItem {
  key: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

interface DiscordTabsProps {
  tabs: DiscordTabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

const DiscordTabs = ({ tabs, activeTab, onTabChange, className }: DiscordTabsProps) => {
  const activeContent = tabs.find(tab => tab.key === activeTab)?.content;

  return (
    <div className={cn("flex flex-col md:flex-row gap-4 md:gap-4 min-h-[calc(100vh-200px)]  py-4", className)}>
      {/* Mobile: Horizontal Tabs */}
      <Section className="md:hidden sticky top-0 z-20 bg-content1 border-b border-default-200">
        <ScrollShadow orientation="horizontal" className="flex gap-1 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all duration-200",
                "text-sm font-medium",
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "bg-default-100 text-default-600 hover:bg-default-200"
              )}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </ScrollShadow>
      </Section>

      {/* Desktop: Vertical Sidebar */}
      <div className="hidden md:flex flex-col w-56 flex-shrink-0">
        <Section className="sticky top-4 p-3 rounded-lg">
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                  "text-sm font-medium group relative",
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "text-default-600 hover:bg-default-100 hover:text-default-900"
                )}
              >
                {/* Active indicator bar */}
                <div
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-200",
                    activeTab === tab.key
                      ? "bg-primary opacity-100"
                      : "opacity-0"
                  )}
                />
                
                {/* Icon */}
                <span
                  className={cn(
                    "text-lg transition-colors duration-200",
                    activeTab === tab.key
                      ? "text-primary"
                      : "text-default-400 group-hover:text-default-600"
                  )}
                >
                  {tab.icon}
                </span>
                
                {/* Label */}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeContent}
      </div>
    </div>
  );
};

export default DiscordTabs;
