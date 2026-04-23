import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(null);

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
    select: (data) => data.settings,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setDraft(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload) => settingsApi.update(payload),
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to save settings.")),
  });

  if (!draft) {
    return (
      <Card>
        <CardContent className="p-6">Loading settings...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-surface-600">
              Settings
            </p>
            <h1 className="mt-2 font-display text-5xl text-ink-900">Update the business details</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700/70">
              Keep the brand voice, contact details, policies, and booking rules current from one calm editing space.
            </p>
          </div>
          <Button onClick={() => saveMutation.mutate(draft)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-5 p-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="business-name">Business name</Label>
            <Input
              id="business-name"
              value={draft.businessName}
              onChange={(event) =>
                setDraft((current) => ({ ...current, businessName: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-tagline">Tagline</Label>
            <Input
              id="business-tagline"
              value={draft.tagline}
              onChange={(event) =>
                setDraft((current) => ({ ...current, tagline: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="business-description">Description</Label>
            <Textarea
              id="business-description"
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-5 p-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact email</Label>
            <Input
              id="contact-email"
              type="email"
              value={draft.contactEmail}
              onChange={(event) =>
                setDraft((current) => ({ ...current, contactEmail: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Contact phone</Label>
            <Input
              id="contact-phone"
              value={draft.contactPhone}
              onChange={(event) =>
                setDraft((current) => ({ ...current, contactPhone: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={draft.address}
              onChange={(event) =>
                setDraft((current) => ({ ...current, address: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={draft.socialLinks.instagram}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  socialLinks: { ...current.socialLinks, instagram: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={draft.socialLinks.facebook}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  socialLinks: { ...current.socialLinks, facebook: event.target.value },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-5 p-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cancellation-policy">Cancellation policy</Label>
            <Textarea
              id="cancellation-policy"
              value={draft.policies.cancellation}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  policies: { ...current.policies, cancellation: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lateness-policy">Lateness policy</Label>
            <Textarea
              id="lateness-policy"
              value={draft.policies.lateness}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  policies: { ...current.policies, lateness: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit-policy">Deposit note</Label>
            <Textarea
              id="deposit-policy"
              value={draft.policies.deposit}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  policies: { ...current.policies, deposit: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectations-policy">Booking expectations</Label>
            <Textarea
              id="expectations-policy"
              value={draft.policies.expectations}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  policies: { ...current.policies, expectations: event.target.value },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-5 p-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cancel-hours">Client cancel window (hours)</Label>
            <Input
              id="cancel-hours"
              type="number"
              value={draft.bookingSettings.allowClientCancelHours}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  bookingSettings: {
                    ...current.bookingSettings,
                    allowClientCancelHours: Number(event.target.value),
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reschedule-hours">Client reschedule window (hours)</Label>
            <Input
              id="reschedule-hours"
              type="number"
              value={draft.bookingSettings.allowClientRescheduleHours}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  bookingSettings: {
                    ...current.bookingSettings,
                    allowClientRescheduleHours: Number(event.target.value),
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-window-days">Booking window (days)</Label>
            <Input
              id="booking-window-days"
              type="number"
              value={draft.bookingSettings.bookingWindowDays}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  bookingSettings: {
                    ...current.bookingSettings,
                    bookingWindowDays: Number(event.target.value),
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="advance-notice">Advance notice (hours)</Label>
            <Input
              id="advance-notice"
              type="number"
              value={draft.bookingSettings.advanceNoticeHours}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  bookingSettings: {
                    ...current.bookingSettings,
                    advanceNoticeHours: Number(event.target.value),
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="confirmation-message">Confirmation message</Label>
            <Textarea
              id="confirmation-message"
              value={draft.bookingSettings.confirmationMessage}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  bookingSettings: {
                    ...current.bookingSettings,
                    confirmationMessage: event.target.value,
                  },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-5 p-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary color</Label>
            <Input
              id="primary-color"
              value={draft.branding.primaryColor}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  branding: { ...current.branding, primaryColor: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accent-color">Accent color</Label>
            <Input
              id="accent-color"
              value={draft.branding.accentColor}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  branding: { ...current.branding, accentColor: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neutral-color">Neutral color</Label>
            <Input
              id="neutral-color"
              value={draft.branding.neutralColor}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  branding: { ...current.branding, neutralColor: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-image">Hero image URL</Label>
            <Input
              id="hero-image"
              value={draft.branding.heroImageUrl}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  branding: { ...current.branding, heroImageUrl: event.target.value },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
