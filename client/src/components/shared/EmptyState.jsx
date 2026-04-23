import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <Card className="border-dashed border-surface-200 bg-white/80">
      <CardContent className="flex flex-col items-start gap-4 p-8">
        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-600">
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-ink-900">{title}</h3>
          <p className="max-w-xl text-sm leading-6 text-ink-700/75">
            {description}
          </p>
        </div>
        {actionLabel ? (
          <Button type="button" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
