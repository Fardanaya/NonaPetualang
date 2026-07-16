import { FaCheck, FaCircle } from "react-icons/fa";
import { FaRegCircle, FaCircleDot, FaCircleCheck, FaHourglass } from "react-icons/fa6";

interface Step {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}

// Default icons for steps when no icon is provided
const defaultStepIcons = [
  <FaCircleDot key="1" />,
  <FaCircle key="2" />,
  <FaRegCircle key="3" />,
  <FaHourglass key="4" />,
];

/**
 * Determines the visibility of the "previous" and "next" stepper buttons.
 *
 * @param step - The current step index.
 * @param total - The total number of steps.
 * @returns An object with boolean values indicating whether the "prev" and "next" buttons should be visible.
 */
export const isStepperButtonVisible = (step: number, total: number) => {
  return {
    prev: step > 0,
    next: step < total - 1,
  };
};

/**
 * A horizontal stepper component that displays the current step and previous steps.
 *
 * @param {Step[]} steps - An array of steps, each with a label and value.
 * @param {number} [activeStep=0] - The index of the current step.
 * @param {"default"|"view"} [mode] - The stepper mode. If "view", the stepper is read-only.
 * @param {boolean} [completed=false] - Whether the stepper is completed.
 * @returns A horizontal stepper component.
 */
export const Stepper = ({
  steps,
  activeStep = 0,
  mode,
  completed = false,
}: {
  steps: Step[];
  activeStep: number;
  mode?: "default" | "view";
  completed?: boolean;
}) => {
  const isCompleted = (step: number) => completed || step < activeStep;
  const isActive = (step: number) => step === activeStep && !completed;

  // Get icon for a step - use provided icon, or fallback to default
  const getStepIcon = (step: Step, index: number) => {
    if (step.icon) return step.icon;
    return defaultStepIcons[index % defaultStepIcons.length];
  };

  return (
    <ol className="flex w-full text-xs font-medium sm:text-base">
      {steps.map((step, index) => (
        <li
          key={step.value}
          className={`flex justify-center w-full relative transition-all duration-300 ${isCompleted(index)
              ? "text-primary"
              : isActive(index)
                ? "text-primary"
                : "text-default-600"
            } after:content-[''] after:w-full after:h-0.5 after:inline-block after:absolute after:top-4 after:left-1/2 ${index < steps.length - 1
              ? isCompleted(index)
                ? "after:bg-primary after:scale-x-100 after:transition-transform after:duration-300"
                : "after:bg-default-700 after:scale-x-100 after:transition-transform after:duration-300"
              : ""
            }`}
        >
          <div className="block whitespace-nowrap z-10 text-sm">
            <span
              className={`w-8 h-8 border-2 rounded-full flex justify-center items-center mx-auto mb-2 text-sm transition-all duration-300 ${isCompleted(index)
                  ? "bg-primary text-white border-transparent"
                  : isActive(index)
                    ? "bg-default-100 text-primary font-semibold border-primary scale-[1.30]"
                    : "bg-default-400 text-default-700 border-default-700"
                }`}
            >
              {mode !== "view" && isCompleted(index) ? (
                <FaCheck />
              ) : (
                getStepIcon(step, index)
              )}
            </span>{" "}
            <span className="block text-center break-words whitespace-normal px-1">
              {step.label}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
};
