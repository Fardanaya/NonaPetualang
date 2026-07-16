"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { Button } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import Link from "next/link";
import { FaBox, FaTags, FaUser } from "react-icons/fa";

const masterItems = [
  {
    title: "Brand",
    description: "Kelola brand untuk katalog alat",
    href: "/admin/master/brand",
    icon: FaTags,
    color: "primary",
  },
  {
    title: "Series",
    description: "Kelola series karakter untuk katalog",
    href: "/admin/master/series",
    icon: FaBox,
    color: "secondary",
  },
  {
    title: "Character",
    description: "Kelola karakter untuk katalog",
    href: "/admin/master/character",
    icon: FaUser,
    color: "success",
  },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Section className="px-4 py-3">
        <h1 className="text-2xl font-bold">Master Data</h1>
        <p className="text-default-500">
          Kelola data master untuk sistem inventory dan katalog
        </p>
      </Section>

      <Section className="px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterItems.map((item) => (
            <Card
              key={item.title}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center gap-3">
                <item.icon className={`text-${item.color} text-xl`} />
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </CardHeader>
              <CardBody>
                <p className="text-default-600 text-sm mb-4">
                  {item.description}
                </p>
                <Button
                  as={Link}
                  href={item.href}
                  color={item.color as any}
                  fullWidth
                >
                  Kelola
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
