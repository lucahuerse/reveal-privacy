import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[6px] text-[13.5px] font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-blue text-white border border-blue hover:bg-[#1d4ed8] hover:border-[#1d4ed8] active:bg-[#1e40af] font-semibold",
        outline:
          "bg-white border border-border-strong text-text-1 hover:bg-bg-muted",
        ghost:
          "bg-transparent border-transparent text-text-2 hover:bg-bg-muted hover:text-text-1",
        destructive:
          "bg-transparent border-transparent text-text-3 hover:bg-red-light hover:text-red hover:border-red-mid",
        green:
          "bg-green text-white border border-green hover:bg-[#15803d] font-semibold",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 py-1.5 text-[12px]",
        xs: "h-6 px-2 py-1 text-[11px] rounded",
        lg: "h-11 px-7 py-3 text-[15px] rounded-lg font-semibold",
        icon: "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
