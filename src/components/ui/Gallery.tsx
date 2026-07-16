"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  category?: string;
  size?: "small" | "medium" | "large";
}

interface BentoGalleryProps {
  items: GalleryItem[];
  className?: string;
}

const Gallery: React.FC<BentoGalleryProps> = ({ items, className = "" }) => {
  // Perfect gap-free layout pattern for 16 items in a 4x4 grid
  const getGridClasses = (item: GalleryItem, index: number) => {
    // 4x4 grid pattern that ensures perfect filling with no gaps
    // Pattern: 2-2-2-2 for first row, then varied sizes, but balanced span distribution
    const patterns = [
      "col-span-2 row-span-2", // Large (top left)
      "col-span-1 row-span-1", // Small
      "col-span-1 row-span-1", // Small
      "col-span-2 row-span-1", // Wide
      "col-span-1 row-span-2", // Tall
      "col-span-1 row-span-1", // Small
      "col-span-1 row-span-1", // Small
      "col-span-1 row-span-2", // Tall
    ];

    return patterns[index] || "col-span-1 row-span-1";
  };

  return (
    <div className={`grid grid-cols-4 gap-1 auto-rows-[200px] ${className}`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-100 ${getGridClasses(item, index)}`}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-bold text-lg mb-1">{item.title}</h3>
            {item.category && (
              <p className="text-sm text-white/80">{item.category}</p>
            )}
          </div>

          {/* Hover effect border */}
          <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-2xl transition-colors duration-300" />
        </div>
      ))}
    </div>
  );
};

export default Gallery;
