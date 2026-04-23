import { cn } from "@/lib/utils";

export function PageIntro({ eyebrow, title, description, className }) {
  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-surface-600">
        {eyebrow}
      </p>
      <div className="space-y-3">
        <h1 className="font-display text-5xl text-ink-900 sm:text-6xl">{title}</h1>
        <p className="max-w-2xl text-base leading-7 text-ink-700/80 sm:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
