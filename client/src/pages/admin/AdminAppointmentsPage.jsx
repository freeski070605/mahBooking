import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  CircleSlash2,
  Plus,
  RefreshCcw,
  UserRoundX,
} from "lucide-react";
import { toast } from "sonner";
import { appointmentsApi, servicesApi } from "@/lib/api";
import {
  formatAppointmentLabel,
  formatLongDate,
  formatTimeLabel,
  getErrorMessage,
  groupAppointmentsByDate,
} from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const emptyAppointment = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  serviceId: "",
  date: "",
  startTime: "",
  notes: "",
  internalNotes: "",
  status: "confirmed",
};

const quickStatuses = [
  { label: "Confirm", value: "confirmed", icon: CheckCircle2 },
  { label: "Complete", value: "completed", icon: CheckCircle2 },
  { label: "No-show", value: "no-show", icon: UserRoundX },
  { label: "Cancel", value: "canceled", icon: CircleSlash2 },
];

export function AdminAppointmentsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState("list");
  const [filters, setFilters] = useState({ status: "all", date: "" });
  const [open, setOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [draft, setDraft] = useState(emptyAppointment);

  const appointmentsQuery = useQuery({
    queryKey: ["admin-appointments", filters],
    queryFn: () =>
      appointmentsApi.list({
        ...(filters.status !== "all" ? { status: filters.status } : {}),
        ...(filters.date ? { date: filters.date } : {}),
      }),
    select: (data) => data.appointments,
  });

  const servicesQuery = useQuery({
    queryKey: ["admin-appointment-services"],
    queryFn: () => servicesApi.list({ scope: "all" }),
    select: (data) => data.services,
  });

  const slotsQuery = useQuery({
    queryKey: ["appointment-editor-slots", draft.serviceId, draft.date],
    enabled: Boolean(draft.serviceId && draft.date),
    queryFn: () =>
      appointmentsApi.slots({
        serviceId: draft.serviceId,
        date: draft.date,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => appointmentsApi.create(payload),
    onSuccess: () => {
      toast.success("Appointment created");
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setOpen(false);
      setDraft(emptyAppointment);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to create appointment.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => appointmentsApi.update(id, payload),
    onSuccess: () => {
      toast.success("Appointment updated");
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setOpen(false);
      setEditingAppointment(null);
      setDraft(emptyAppointment);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to update appointment.")),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => appointmentsApi.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to update status.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appointmentsApi.remove(id),
    onSuccess: () => {
      toast.success("Appointment removed");
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Unable to remove appointment.")),
  });

  const appointments = appointmentsQuery.data || [];
  const groupedAppointments = useMemo(
    () => groupAppointmentsByDate(appointments),
    [appointments],
  );

  function openCreate() {
    setEditingAppointment(null);
    setDraft(emptyAppointment);
    setOpen(true);
  }

  function openEdit(appointment) {
    setEditingAppointment(appointment);
    setDraft({
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      clientPhone: appointment.clientPhone,
      serviceId:
        typeof appointment.serviceId === "object"
          ? appointment.serviceId._id
          : appointment.serviceId,
      date: appointment.appointmentDate,
      startTime: appointment.startTime,
      notes: appointment.notes || "",
      internalNotes: appointment.internalNotes || "",
      status: appointment.status,
    });
    setOpen(true);
  }

  function submitAppointment(event) {
    event.preventDefault();

    const payload = {
      clientName: draft.clientName,
      clientEmail: draft.clientEmail,
      clientPhone: draft.clientPhone,
      serviceId: draft.serviceId,
      date: draft.date,
      startTime: draft.startTime,
      notes: draft.notes,
      internalNotes: draft.internalNotes,
      status: draft.status,
    };

    if (
      !payload.clientName ||
      !payload.clientEmail ||
      !payload.clientPhone ||
      !payload.serviceId ||
      !payload.date ||
      !payload.startTime
    ) {
      toast.error("Please complete the client, service, date, and time details.");
      return;
    }

    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-surface-600">
              Appointments
            </p>
            <h1 className="mt-2 font-display text-5xl text-ink-900">
              Keep the calendar clear and easy to manage
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700/70">
              Add appointments to the schedule yourself, update visit details,
              or remove bookings cleanly when plans change.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add to schedule
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-[200px_200px_1fr]">
            <div className="space-y-2">
              <Label htmlFor="filter-date">Filter by date</Label>
              <Input
                id="filter-date"
                type="date"
                value={filters.date}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Filter by status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    status: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="no-show">No-show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Tabs value={view} onValueChange={setView}>
                <TabsList>
                  <TabsTrigger value="list">List view</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar view</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {!appointments.length ? (
        <EmptyState
          icon={CalendarDays}
          title="No appointments match these filters"
          description="Try another date or status, or add the first appointment to the schedule."
          actionLabel="Add appointment"
          onAction={openCreate}
        />
      ) : (
        <Tabs value={view} onValueChange={setView}>
          <TabsContent value="list" className="mt-0">
            <div className="grid gap-5">
              {appointments.map((appointment) => (
                <Card key={appointment._id}>
                  <CardContent className="space-y-5 p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                            {appointment.serviceSnapshot.category}
                          </p>
                          <StatusBadge status={appointment.status} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-ink-900">
                            {appointment.clientName}
                          </h2>
                          <p className="text-sm text-ink-700/70">
                            {appointment.serviceSnapshot.name}
                          </p>
                        </div>
                        <div className="grid gap-2 text-sm text-ink-700/70 md:grid-cols-2">
                          <p>{formatAppointmentLabel(appointment.startAt)}</p>
                          <p>{appointment.clientEmail}</p>
                          <p>{appointment.clientPhone}</p>
                          {appointment.notes ? (
                            <p>Client note: {appointment.notes}</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="secondary"
                          onClick={() => openEdit(appointment)}
                        >
                          <RefreshCcw className="h-4 w-4" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline">Remove</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove this appointment from the schedule?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently removes the booking record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep appointment</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteMutation.mutate(appointment._id)
                                }
                              >
                                Remove appointment
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {quickStatuses.map((item) => {
                        const Icon = item.icon;

                        return (
                          <Button
                            key={item.value}
                            type="button"
                            variant={
                              appointment.status === item.value
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              statusMutation.mutate({
                                id: appointment._id,
                                status: item.value,
                              })
                            }
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <div className="grid gap-5">
              {Object.entries(groupedAppointments).map(([date, items]) => (
                <Card key={date}>
                  <CardContent className="space-y-4 p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                        {date}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-ink-900">
                        {formatLongDate(date)}
                      </h2>
                    </div>
                    <div className="grid gap-4">
                      {items.map((appointment) => (
                        <div
                          key={appointment._id}
                          className="rounded-[1.5rem] border border-surface-100 bg-surface-50 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-ink-900">
                                {formatTimeLabel(appointment.startAt)} -{" "}
                                {appointment.clientName}
                              </p>
                              <p className="text-sm text-ink-700/70">
                                {appointment.serviceSnapshot.name}
                              </p>
                            </div>
                            <StatusBadge status={appointment.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment
                ? "Edit appointment"
                : "Add appointment to the schedule"}
            </DialogTitle>
            <DialogDescription>
              Use this for phone bookings, walk-ins, admin-added visits, or
              schedule adjustments.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6" onSubmit={submitAppointment}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="appointment-name">Client name</Label>
                <Input
                  id="appointment-name"
                  value={draft.clientName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      clientName: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-phone">Phone</Label>
                <Input
                  id="appointment-phone"
                  value={draft.clientPhone}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      clientPhone: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="appointment-email">Email</Label>
                <Input
                  id="appointment-email"
                  type="email"
                  value={draft.clientEmail}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      clientEmail: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <Select
                  value={draft.serviceId}
                  onValueChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      serviceId: value,
                      startTime: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose service" />
                  </SelectTrigger>
                  <SelectContent>
                    {(servicesQuery.data || []).map((service) => (
                      <SelectItem key={service._id} value={service._id}>
                        {service.isActive
                          ? service.name
                          : `${service.name} (Inactive)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-date">Date</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  value={draft.date}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      date: event.target.value,
                      startTime:
                        current.date === event.target.value
                          ? current.startTime
                          : "",
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Available time slots</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {slotsQuery.data?.slots?.map((slot) => (
                  <button
                    key={slot.startAt}
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        startTime: slot.startTime,
                      }))
                    }
                    className={`rounded-[1.25rem] border px-4 py-4 text-sm font-semibold transition ${
                      draft.startTime === slot.startTime
                        ? "border-surface-500 bg-surface-500 text-white"
                        : "border-surface-200 bg-white text-ink-900"
                    }`}
                  >
                    {new Date(slot.startAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </button>
                ))}
                {editingAppointment && draft.startTime ? (
                  <button
                    type="button"
                    className="rounded-[1.25rem] border border-surface-200 bg-surface-50 px-4 py-4 text-sm font-semibold text-ink-900"
                  >
                    Current time: {draft.startTime}
                  </button>
                ) : null}
              </div>
              {draft.serviceId &&
              draft.date &&
              !slotsQuery.isLoading &&
              !slotsQuery.data?.slots?.length ? (
                <p className="text-sm leading-6 text-ink-700/70">
                  No open slots were found for that date. Try another day,
                  another service, or adjust availability first.
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="appointment-notes">Client notes</Label>
                <Textarea
                  id="appointment-notes"
                  value={draft.notes}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-internal">Internal notes</Label>
                <Textarea
                  id="appointment-internal"
                  value={draft.internalNotes}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      internalNotes: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={draft.status}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    status: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="no-show">No-show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingAppointment ? "Save changes" : "Add appointment"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
