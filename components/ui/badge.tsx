import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border",
  {
    variants: {
      variant: {
        default: "bg-bg-muted text-text-3 border-border",
        public: "bg-green-light text-green border-green-mid",
        quasi: "bg-yellow-light text-yellow border-yellow-mid",
        sensitive: "bg-orange-light text-orange border-orange-mid",
        direct: "bg-red-light text-red border-red-mid",
        removed: "bg-red-light text-red border-red-mid",
        changed: "bg-green-light text-green border-green-mid",
        kept: "bg-bg-muted text-text-3 border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
