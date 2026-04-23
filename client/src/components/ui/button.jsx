import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-surface-500 text-white shadow-soft hover:bg-surface-600",
        secondary:
          "bg-white text-ink-900 shadow-soft ring-1 ring-surface-200 hover:bg-surface-50",
        ghost: "text-ink-800 hover:bg-white/70",
        outline:
          "border border-surface-300 bg-transparent text-ink-900 hover:bg-surface-50",
        dark: "bg-ink-900 text-white shadow-soft hover:bg-ink-800",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
