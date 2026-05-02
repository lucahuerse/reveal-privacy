import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-[6px] border border-border bg-white px-2.5 py-1.5 text-[13px] font-mono text-text-1 shadow-sm transition-colors placeholder:text-text-4 focus:border-blue focus:outline-none focus:ring-[3px] focus:ring-blue/10 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
