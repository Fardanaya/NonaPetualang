import { IoMdAlert } from "react-icons/io";

export const InputLabel = ({
  label,
  desc,
  showDesc = false,
}: {
  label: string;
  desc?: string;
  showDesc?: boolean;
}) => {
  return (
    <div className="flex flex-col w-full">
      <p className="text-sm md:text-lg text-primary font-semibold">{label}</p>
      <p
        className={`md:block text-xs md:text-sm text-default-800 ${
          showDesc ? "block" : "hidden"
        }`}
      >
        {desc}
      </p>
    </div>
  );
};

export const InputError = ({
  message,
  ...props
}: {
  message: string;
  [key: string]: any;
}) => {
  return (
    <div {...props}>
      <div className="flex gap-1 items-center text-red-500">
        <IoMdAlert size={14} />
        <p className="text-xs leading-none">{message}</p>
      </div>
    </div>
  );
};
