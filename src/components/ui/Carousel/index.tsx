import React, { useState, useEffect, useCallback } from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Thumb } from "./Thumbnail";
import "./style.css";

type PropType = {
  slides: string[];
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = ({ slides, options }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options);
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    const index = emblaMainApi.selectedScrollSnap();

    setSelectedIndex(index);
    emblaThumbsApi.scrollTo(index);
  }, [emblaMainApi, emblaThumbsApi]);

  useEffect(() => {
    if (!emblaMainApi) return;

    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <div className="relative w-full">
      {slides.length > 1 && (
        <div className="absolute top-2 right-2.5 z-20 bg-black/50 rounded-full px-2 py-1">
          <div className="flex items-center gap-[2px] text-[0.6rem] text-white font-medium">
            <p>{selectedIndex + 1}</p>
            <span className="text-[0.45rem]">/</span>
            <p>{slides.length}</p>
          </div>
        </div>
      )}

      <div className="flex flex-row gap-1 w-full">
        {/* Thumbnails */}
        {slides.length > 1 && (
          <div className="w-20 flex-shrink-0 hidden md:block aspect-square">
            <div className="embla-thumbs h-full">
              <div
                className="embla-thumbs__viewport rounded-lg h-full overflow-y-auto"
                ref={emblaThumbsRef}
              >
                <div className="embla-thumbs__container">
                  {slides.map((slide, index) => (
                    <Thumb
                      key={index}
                      image={slide}
                      selected={selectedIndex === index}
                      onClick={() => onThumbClick(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Gallery */}
        <div className="flex-1">
          <div className="embla">
            <div className="embla__viewport rounded-lg" ref={emblaMainRef}>
              <div className="embla__container">
                {slides.map((slide, index) => (
                  <div className="embla__slide" key={index}>
                    <div className="relative w-full aspect-square">
                      <Image
                        src={slide}
                        alt={`image-${index}`}
                        fill
                        sizes="100vw"
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
