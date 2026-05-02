"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { num: 1, label: "Import Data" },
  { num: 2, label: "Define Schema" },
  { num: 3, label: "Analyze Risk" },
  { num: 4, label: "Remediate" },
] as const;

interface StepIndicatorProps {
  currentStep: Step;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, index) => {
        const status =
          step.num < currentStep ? "done" : step.num === currentStep ? "active" : "pending";

        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn(
                "flex items-center gap-2 text-[13px] font-medium cursor-default",
                status === "active" && "text-blue",
                status === "done" && "text-green",
                status === "pending" && "text-text-3"
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-semibold shrink-0",
                  status === "pending" && "border-text-3 text-text-3",
                  status === "active" && "bg-blue border-blue text-white",
                  status === "done" && "bg-green border-green text-white"
                )}
              >
                {status === "done" ? <Check className="w-3.5 h-3.5" /> : step.num}
              </div>
              <span className="whitespace-nowrap">{step.label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-border mx-3 min-w-8" />
            )}
          </div>
        );
      })}
    </div>
  );
}
