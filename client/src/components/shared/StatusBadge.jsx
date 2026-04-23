import { Badge } from "@/components/ui/badge";
import { getStatusTone } from "@/lib/utils";

export function StatusBadge({ status }) {
  const tone = getStatusTone(status);
  const variantMap = {
    amber: "default",
    emerald: "success",
    rose: "danger",
    slate: "muted",
    stone: "muted",
  };

  return (
    <Badge variant={variantMap[tone]}>
      {String(status || "").replace("-", " ")}
    </Badge>
  );
}
