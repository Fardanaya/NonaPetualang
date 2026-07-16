import { format } from "date-fns";

export const ShippingStepper = ({ steps }: any) => {
  const lastStepIndex = steps.length - 1;

  return (
    <ol className="flex flex-col w-full text-xs font-medium">
      {steps.map((step: any, index: number) => (
        <li
          key={index}
          className="flex items-start pt-1 pb-4 last:pb-0 relative overflow-hidden"
        >
          <div
            className={`w-24 pr-2 flex flex-col items-end gap-0.5 shrink-0 ${
              index !== 0 && "text-gray-400"
            }`}
          >
            <p className="text-[0.6rem] leading-none">
              {step.date ? format(new Date(step.date), "d MMMM yyyy") : "N/A"}
            </p>
            <p className="text-[0.6rem] leading-none">
              {step.date ? format(new Date(step.date), "HH:mm") : "N/A"}
            </p>
          </div>

          <div className="w-8 flex flex-col items-center shrink-0">
            <div className="relative h-6 w-full flex items-center justify-center">
              <div
                className={`absolute ${
                  index === 0 ? "size-5" : "size-3"
                } rounded-full bg-primary`}
              ></div>
              {index < lastStepIndex && (
                <div
                  className="absolute top-1/2 left-1/2 w-px bg-primary transform -translate-x-1/2"
                  style={{ height: "200px" }}
                ></div>
              )}
            </div>
          </div>

          <div className="pl-2 flex-1 min-w-0">
            <p
              className={`text-xs ${
                index === 0 ? "text-primary font-semibold" : "text-gray-400"
              }`}
            >
              {step.desc}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
};
