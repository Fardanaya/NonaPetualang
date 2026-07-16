import { LuTent } from "react-icons/lu";

interface CatalogTitleProps {
  title: string;
  description: string;
}

const CatalogTitle = ({ title, description }: CatalogTitleProps) => {
  return (
    <div className="flex items-center gap-4">
      <LuTent size={32} className="text-primary" />
      <div className="flex flex-col">
        <p className="text-2xl text-primary font-bold tracking-wider">
          {title}
        </p>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  );
};

export default CatalogTitle;
