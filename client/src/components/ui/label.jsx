import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      className={cn("text-sm font-semibold text-ink-900", className)}
      {...props}
    />
  );
}

export { Label };
