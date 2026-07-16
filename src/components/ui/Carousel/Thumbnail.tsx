import Image from "next/image";

type PropType = {
  selected: boolean;
  image: string;
  onClick: () => void;
};

export const Thumb: React.FC<PropType> = ({ selected, image, onClick }) => {
  return (
    <div
      className="relative w-full cursor-pointer embla-thumbs__slide"
      onClick={onClick}
    >
      {!selected && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-10 rounded-lg" />
      )}

      <div className="relative w-full aspect-square">
        <Image
          alt="Thumbnail"
          src={image}
          fill
          className="object-cover rounded-lg"
        />
      </div>
    </div>
  );
};
