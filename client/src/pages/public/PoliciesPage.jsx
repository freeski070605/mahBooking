import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Clock3, WalletCards } from "lucide-react";
import { settingsApi } from "@/lib/api";
import { PageIntro } from "@/components/shared/PageIntro";
import { Card, CardContent } from "@/components/ui/card";

export function PoliciesPage() {
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  });

  const settings = settingsQuery.data?.settings;

  const policyCards = [
    {
      title: "Cancellation policy",
      icon: ClipboardCheck,
      description: settings?.policies?.cancellation,
    },
    {
      title: "Lateness policy",
      icon: Clock3,
      description: settings?.policies?.lateness,
    },
    {
      title: "Deposit support",
      icon: WalletCards,
      description: settings?.policies?.deposit,
    },
  ];

  return (
    <div className="page-shell space-y-10">
      <PageIntro
        eyebrow="Policies"
        title="Clear expectations that still feel thoughtful and human."
        description="Policies are written in straightforward language so clients understand how to protect their appointment time and what to expect before arriving."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {policyCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardContent className="space-y-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold text-ink-900">{item.title}</h2>
                <p className="text-sm leading-7 text-ink-700/75">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="space-y-4 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-surface-600">
            Before you book
          </p>
          <h2 className="font-display text-5xl text-ink-900">A smooth visit starts with a little prep.</h2>
          <p className="max-w-3xl text-base leading-8 text-ink-700/80">
            {settings?.policies?.expectations ||
              "Arrive ready for your selected service and review any preparation notes ahead of time. These expectations help appointments stay on schedule and feel relaxed once you arrive."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
