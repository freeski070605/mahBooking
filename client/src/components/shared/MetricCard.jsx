import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({ label, value, helper, icon: Icon }) {
  return (
    <Card className="bg-white/90">
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-ink-700/70">{label}</p>
          <div className="text-3xl font-semibold text-ink-900">{value}</div>
          {helper ? <p className="text-sm text-ink-700/60">{helper}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-600">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
