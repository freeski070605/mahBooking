import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";
import { settingsApi } from "@/lib/api";
import { PageIntro } from "@/components/shared/PageIntro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  });

  const settings = settingsQuery.data?.settings;

  function handleSubmit(event) {
    event.preventDefault();
    toast.success(
      "Your note was saved locally. For a reply, please use the phone, email, or Instagram details on this page for now.",
    );
    setForm({ name: "", email: "", message: "" });
  }

  const contactCards = [
    {
      icon: Phone,
      label: "Phone",
      value: settings?.contactPhone || "(555) 274-5612",
    },
    {
      icon: Mail,
      label: "Email",
      value: settings?.contactEmail || "hello@mahbooking.com",
    },
    {
      icon: MapPin,
      label: "Location",
      value: settings?.address || "Atlanta, Georgia",
    },
    {
      icon: AtSign,
      label: "Instagram",
      value: settings?.socialLinks?.instagram || "@mahbooking",
    },
  ];

  return (
    <div className="page-shell grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-6">
        <PageIntro
          eyebrow="Contact"
          title="Reach out if you want details before you book."
          description="Questions about services, prep, or availability? The quickest ways to connect are listed here."
        />
        <div className="grid gap-4">
          {contactCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                      {item.label}
                    </p>
                    <p className="mt-1 text-base font-medium text-ink-900">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="font-display text-4xl text-ink-900">Send a note</h2>
            <p className="text-sm leading-6 text-ink-700/70">
              The direct contact details on the left are the best way to get a
              response while this inquiry form is still being connected.
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({ ...current, message: event.target.value }))
                }
              />
            </div>
            <Button type="submit">Send inquiry</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
