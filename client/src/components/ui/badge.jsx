import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
  {
    variants: {
      variant: {
        default: "bg-surface-100 text-surface-700",
        success: "bg-emerald-100 text-emerald-700",
        danger: "bg-rose-100 text-rose-700",
        muted: "bg-stone-100 text-stone-600",
        outline: "border border-surface-200 bg-transparent text-ink-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
