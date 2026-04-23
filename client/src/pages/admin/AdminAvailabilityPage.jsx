import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus2, Clock3, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { availabilityApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function AdminAvailabilityPage() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(null);

  const availabilityQuery = useQuery({
    queryKey: ["availability"],
    queryFn: () => availabilityApi.get(),
    select: (data) => data.availability,
  });

  useEffect(() => {
    if (availabilityQuery.data) {
      setDraft(availabilityQuery.data);
    }
  }, [availabilityQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload) => availabilityApi.update(payload),
    onSuccess: () => {
      toast.success("Availability updated");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to save availability.")),
  });

  if (!draft) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">Loading availability...</CardContent>
        </Card>
      </div>
    );
  }

  function updateWeeklyDay(index, key, value) {
    setDraft((current) => {
      const weeklyHours = [...current.weeklyHours];
      weeklyHours[index] = { ...weeklyHours[index], [key]: value };
      return { ...current, weeklyHours };
    });
  }

  function updateBreak(dayIndex, breakIndex, key, value) {
    setDraft((current) => {
      const weeklyHours = [...current.weeklyHours];
      const day = { ...weeklyHours[dayIndex] };
      const breaks = [...day.breaks];
      breaks[breakIndex] = { ...breaks[breakIndex], [key]: value };
      day.breaks = breaks;
      weeklyHours[dayIndex] = day;
      return { ...current, weeklyHours };
    });
  }

  function addBreak(dayIndex) {
    setDraft((current) => {
      const weeklyHours = [...current.weeklyHours];
      weeklyHours[dayIndex] = {
        ...weeklyHours[dayIndex],
        breaks: [...weeklyHours[dayIndex].breaks, { start: "13:00", end: "14:00" }],
      };
      return { ...current, weeklyHours };
    });
  }

  function removeBreak(dayIndex, breakIndex) {
    setDraft((current) => {
      const weeklyHours = [...current.weeklyHours];
      weeklyHours[dayIndex] = {
        ...weeklyHours[dayIndex],
        breaks: weeklyHours[dayIndex].breaks.filter((_, index) => index !== breakIndex),
      };
      return { ...current, weeklyHours };
    });
  }

  function updateBlockedDate(index, key, value) {
    setDraft((current) => {
      const blockedDates = [...current.blockedDates];
      blockedDates[index] = { ...blockedDates[index], [key]: value };
      return { ...current, blockedDates };
    });
  }

  function updateOverride(index, key, value) {
    setDraft((current) => {
      const dateOverrides = [...current.dateOverrides];
      dateOverrides[index] = { ...dateOverrides[index], [key]: value };
      return { ...current, dateOverrides };
    });
  }

  function updateOverrideBreak(overrideIndex, breakIndex, key, value) {
    setDraft((current) => {
      const dateOverrides = [...current.dateOverrides];
      const override = { ...dateOverrides[overrideIndex] };
      const breaks = [...override.breaks];
      breaks[breakIndex] = { ...breaks[breakIndex], [key]: value };
      override.breaks = breaks;
      dateOverrides[overrideIndex] = override;
      return { ...current, dateOverrides };
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-surface-600">
              Availability
            </p>
            <h1 className="mt-2 font-display text-5xl text-ink-900">Set working hours and blocked time</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700/70">
              Keep this simple: choose the weekly schedule, add breaks, and block out school, travel, or personal days when needed.
            </p>
          </div>
          <Button onClick={() => saveMutation.mutate(draft)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save availability"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={draft.timezone}
              onChange={(event) =>
                setDraft((current) => ({ ...current, timezone: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slot-interval">Slot interval (minutes)</Label>
            <Input
              id="slot-interval"
              type="number"
              value={draft.slotIntervalMinutes}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  slotIntervalMinutes: Number(event.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-window">Booking window (days)</Label>
            <Input
              id="booking-window"
              type="number"
              value={draft.bookingWindowDays}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  bookingWindowDays: Number(event.target.value),
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5">
        {draft.weeklyHours.map((day, index) => (
          <Card key={day.label}>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-ink-900">{day.label}</h2>
                  <p className="text-sm text-ink-700/65">
                    Turn a day on or off and set working hours in plain time blocks.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink-900">
                    {day.isOpen ? "Open" : "Closed"}
                  </span>
                  <Switch
                    checked={day.isOpen}
                    onCheckedChange={(value) => updateWeeklyDay(index, "isOpen", value)}
                  />
                </div>
              </div>
              {day.isOpen ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Start time</Label>
                      <Input
                        type="time"
                        value={day.start}
                        onChange={(event) => updateWeeklyDay(index, "start", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End time</Label>
                      <Input
                        type="time"
                        value={day.end}
                        onChange={(event) => updateWeeklyDay(index, "end", event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">Breaks</p>
                        <p className="text-sm text-ink-700/65">
                          Use breaks for lunch or short pauses in the day.
                        </p>
                      </div>
                      <Button variant="secondary" onClick={() => addBreak(index)}>
                        <Plus className="h-4 w-4" />
                        Add break
                      </Button>
                    </div>
                    <div className="grid gap-4">
                      {day.breaks.map((breakItem, breakIndex) => (
                        <div
                          key={`${day.label}-${breakIndex}`}
                          className="grid gap-4 rounded-[1.4rem] bg-surface-50 p-4 sm:grid-cols-[1fr_1fr_auto]"
                        >
                          <Input
                            type="time"
                            value={breakItem.start}
                            onChange={(event) =>
                              updateBreak(index, breakIndex, "start", event.target.value)
                            }
                          />
                          <Input
                            type="time"
                            value={breakItem.end}
                            onChange={(event) =>
                              updateBreak(index, breakIndex, "end", event.target.value)
                            }
                          />
                          <Button
                            variant="ghost"
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => removeBreak(index, breakIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-ink-900">Blocked dates</h2>
              <p className="text-sm text-ink-700/65">Block full days or part of a day for vacation, school, or personal time.</p>
            </div>
            <Button
              variant="secondary"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  blockedDates: [
                    ...current.blockedDates,
                    { date: "", start: "", end: "", allDay: true, reason: "" },
                  ],
                }))
              }
            >
              <CalendarPlus2 className="h-4 w-4" />
              Add blocked date
            </Button>
          </div>
          <div className="grid gap-4">
            {draft.blockedDates.map((item, index) => (
              <div key={`blocked-${index}`} className="grid gap-4 rounded-[1.5rem] bg-surface-50 p-4 md:grid-cols-5">
                <Input
                  type="date"
                  value={item.date}
                  onChange={(event) => updateBlockedDate(index, "date", event.target.value)}
                />
                <Input
                  type="time"
                  value={item.start}
                  disabled={item.allDay}
                  onChange={(event) => updateBlockedDate(index, "start", event.target.value)}
                />
                <Input
                  type="time"
                  value={item.end}
                  disabled={item.allDay}
                  onChange={(event) => updateBlockedDate(index, "end", event.target.value)}
                />
                <Input
                  placeholder="Reason"
                  value={item.reason}
                  onChange={(event) => updateBlockedDate(index, "reason", event.target.value)}
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={item.allDay}
                      onCheckedChange={(value) => updateBlockedDate(index, "allDay", value)}
                    />
                    <span className="text-sm font-semibold text-ink-900">All day</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        blockedDates: current.blockedDates.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-ink-900">Date overrides</h2>
              <p className="text-sm text-ink-700/65">
                Use an override when a single date should have different hours than the normal weekly schedule.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  dateOverrides: [
                    ...current.dateOverrides,
                    { date: "", isOpen: true, start: "09:00", end: "17:00", breaks: [] },
                  ],
                }))
              }
            >
              <Clock3 className="h-4 w-4" />
              Add override
            </Button>
          </div>
          <div className="grid gap-4">
            {draft.dateOverrides.map((item, index) => (
              <div key={`override-${index}`} className="rounded-[1.5rem] bg-surface-50 p-4">
                <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_1fr_auto]">
                  <Input
                    type="date"
                    value={item.date}
                    onChange={(event) => updateOverride(index, "date", event.target.value)}
                  />
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={item.isOpen}
                      onCheckedChange={(value) => updateOverride(index, "isOpen", value)}
                    />
                    <span className="text-sm font-semibold text-ink-900">
                      {item.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                  <Input
                    type="time"
                    value={item.start}
                    disabled={!item.isOpen}
                    onChange={(event) => updateOverride(index, "start", event.target.value)}
                  />
                  <Input
                    type="time"
                    value={item.end}
                    disabled={!item.isOpen}
                    onChange={(event) => updateOverride(index, "end", event.target.value)}
                  />
                  <Button
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        dateOverrides: current.dateOverrides.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {item.isOpen ? (
                  <div className="mt-4 space-y-3">
                    {item.breaks.map((breakItem, breakIndex) => (
                      <div key={`override-break-${breakIndex}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                        <Input
                          type="time"
                          value={breakItem.start}
                          onChange={(event) =>
                            updateOverrideBreak(index, breakIndex, "start", event.target.value)
                          }
                        />
                        <Input
                          type="time"
                          value={breakItem.end}
                          onChange={(event) =>
                            updateOverrideBreak(index, breakIndex, "end", event.target.value)
                          }
                        />
                        <Button
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() =>
                            setDraft((current) => {
                              const dateOverrides = [...current.dateOverrides];
                              dateOverrides[index] = {
                                ...dateOverrides[index],
                                breaks: dateOverrides[index].breaks.filter((_, childIndex) => childIndex !== breakIndex),
                              };
                              return { ...current, dateOverrides };
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() =>
                        setDraft((current) => {
                          const dateOverrides = [...current.dateOverrides];
                          dateOverrides[index] = {
                            ...dateOverrides[index],
                            breaks: [...dateOverrides[index].breaks, { start: "13:00", end: "14:00" }],
                          };
                          return { ...current, dateOverrides };
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Add override break
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
