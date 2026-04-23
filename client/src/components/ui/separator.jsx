import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

function Separator({ className, orientation = "horizontal", ...props }) {
  return (
    <SeparatorPrimitive.Root
      className={cn(
        "shrink-0 bg-surface-200",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      orientation={orientation}
      {...props}
    />
  );
}

export { Separator };
