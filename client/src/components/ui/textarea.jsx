import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "flex min-h-[132px] w-full rounded-[1.5rem] border border-surface-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-300",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
