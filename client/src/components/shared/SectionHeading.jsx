import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}) {
  return (
    <motion.div
      className={cn(
        "space-y-4",
        align === "center" && "mx-auto max-w-2xl text-center",
        className,
      )}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5 }}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-surface-600">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-3">
        <h2 className="font-display text-4xl text-ink-900 sm:text-5xl">{title}</h2>
        {description ? (
          <p className="text-base leading-7 text-ink-700/80 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
