interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <div
      className={`border-1 border-default-200 rounded-lg bg-default-100 shadow ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export const SectionTitle = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-primary font-semibold text-lg md:text-xl leading-none capitalize">
        {title}
      </p>
      <p className="text-xs md:text-sm">{description}</p>
    </div>
  );
};
