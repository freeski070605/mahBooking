import { cn } from "@/lib/utils";

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-300",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
