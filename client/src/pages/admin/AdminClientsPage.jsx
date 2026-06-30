import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api";
import { formatAppointmentLabel, getErrorMessage } from "@/lib/utils";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const emptyClient = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  birthday: "",
  skinType: "",
  skinConcerns: "",
  allergies: "",
  currentSkincareRoutine: "",
  recommendedFollowUp: "",
  notes: "",
  internalNotes: "",
  isFlagged: false,
  tags: [],
};

function clientDisplayName(client) {
  return (
    [client.firstName, client.lastName].filter(Boolean).join(" ").trim() ||
    client.name ||
    "Unnamed client"
  );
}

function toDateInput(value) {
  return value ? new Date(value).toISOString().split("T")[0] : "";
}

export function AdminClientsPage() {
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [draft, setDraft] = useState(emptyClient);

  const clientsQuery = useQuery({
    queryKey: ["clients", search],
    queryFn: () => clientsApi.list(search ? { search } : {}),
    select: (data) => data.clients,
  });

  const activeClientId = selectedClientId || clientsQuery.data?.[0]?._id || "";

  const clientDetailQuery = useQuery({
    queryKey: ["client-detail", activeClientId],
    enabled: Boolean(activeClientId),
    queryFn: () => clientsApi.get(activeClientId),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => clientsApi.create(payload),
    onSuccess: (data) => {
      toast.success("Customer added");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setSelectedClientId(data.client._id);
      setOpen(false);
      setDraft(emptyClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to save customer.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => clientsApi.update(id, payload),
    onSuccess: (data) => {
      toast.success("Customer updated");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client-detail", data.client._id] });
      setOpen(false);
      setEditingClient(null);
      setDraft(emptyClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to update customer.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => clientsApi.remove(id),
    onSuccess: () => {
      toast.success("Customer deleted");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setSelectedClientId("");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to delete customer.")),
  });

  const selectedClient = clientDetailQuery.data?.client;
  const selectedAppointments = useMemo(
    () => clientDetailQuery.data?.appointments || [],
    [clientDetailQuery.data?.appointments],
  );
  const intakeHistory = useMemo(
    () => selectedAppointments.filter((appointment) => appointment.intakeAnswers),
    [selectedAppointments],
  );
  const nextBooking = useMemo(
    () =>
      selectedAppointments.find(
        (appointment) =>
          new Date(appointment.startAt) >= new Date() &&
          !["canceled", "no-show"].includes(appointment.status),
      ),
    [selectedAppointments],
  );

  function openCreate() {
    setEditingClient(null);
    setDraft(emptyClient);
    setOpen(true);
  }

  function openEdit(client) {
    setEditingClient(client);
    setDraft({
      ...emptyClient,
      ...client,
      firstName: client.firstName || client.name?.split(" ")[0] || "",
      lastName: client.lastName || client.name?.split(" ").slice(1).join(" ") || "",
      birthday: toDateInput(client.birthday),
    });
    setOpen(true);
  }

  function submitClient(event) {
    event.preventDefault();

    if (!draft.firstName) {
      toast.error("Please enter at least a first name.");
      return;
    }

    if (editingClient) {
      updateMutation.mutate({ id: editingClient._id, payload: draft });
    } else {
      createMutation.mutate(draft);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-surface-600">
              Customers
            </p>
            <h1 className="mt-2 font-display text-5xl text-ink-900">Customer CRM</h1>
            <p className="mt-3 text-sm leading-7 text-ink-700/70">
              Keep contact details, skin notes, private notes, intake answers, and visit history together.
            </p>
          </div>
          <div className="grid gap-3">
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add customer
            </Button>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/45" />
              <Input
                className="pl-10"
                placeholder="Search customers"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedClientId("");
                }}
              />
            </div>
          </div>

          {!clientsQuery.data?.length ? (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Add a customer manually or let booking requests create records automatically."
              actionLabel="Add customer"
              onAction={openCreate}
            />
          ) : (
            <div className="grid gap-3">
              {clientsQuery.data.map((client) => (
                <button
                  key={client._id}
                  type="button"
                  onClick={() => setSelectedClientId(client._id)}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    activeClientId === client._id
                      ? "border-surface-500 bg-surface-50"
                      : "border-surface-100 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-900">{clientDisplayName(client)}</p>
                      <p className="text-sm text-ink-700/70">{client.email || client.phone}</p>
                    </div>
                    {client.isFlagged ? <Flag className="h-4 w-4 text-rose-600" /> : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-700/65">
                    <span>{client.appointmentCount || 0} visits</span>
                    <span>{client.upcomingCount || 0} upcoming</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-6 p-6">
          {selectedClient ? (
            <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold text-ink-900">
                    {clientDisplayName(selectedClient)}
                  </h2>
                  <p className="mt-2 text-sm text-ink-700/70">{selectedClient.email}</p>
                  <p className="text-sm text-ink-700/70">{selectedClient.phone}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => openEdit(selectedClient)}>
                    Edit customer
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="text-rose-600 hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Appointments will stay in history, but they will no longer be linked to this customer profile.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep customer</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(selectedClient._id)}>
                          Delete customer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <ProfileTile label="Skin type" value={selectedClient.skinType || "Not added"} />
                <ProfileTile label="Client type" value={(selectedAppointments.length || 0) <= 1 ? "First-time" : "Returning"} />
                <ProfileTile label="Birthday" value={toDateInput(selectedClient.birthday) || "Not added"} />
                <ProfileTile label="Last appointment" value={selectedClient.lastAppointmentAt ? formatAppointmentLabel(selectedClient.lastAppointmentAt) : "No visits yet"} />
                <ProfileTile label="Next booking" value={nextBooking ? formatAppointmentLabel(nextBooking.startAt) : "None scheduled"} />
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <ProfilePanel title="Skin concerns" value={selectedClient.skinConcerns || "No skin concerns recorded yet."} />
                <ProfilePanel title="Allergies" value={selectedClient.allergies || "No allergies recorded yet."} />
                <ProfilePanel title="Current routine" value={selectedClient.currentSkincareRoutine || "No routine recorded yet."} />
                <ProfilePanel title="Private notes" value={selectedClient.internalNotes || selectedClient.notes || "No private notes yet."} />
                <ProfilePanel title="Recommended follow-up" value={selectedClient.recommendedFollowUp || "No recommended follow-up yet."} />
              </div>

              <HistorySection appointments={selectedAppointments} />
              <IntakeSection appointments={intakeHistory} />
            </>
          ) : (
            <EmptyState
              icon={Users}
              title="Choose a customer"
              description="Select a customer on the left, or add a new one to start a profile."
              actionLabel="Add customer"
              onAction={openCreate}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Edit customer" : "Add customer"}</DialogTitle>
            <DialogDescription>
              Keep the details useful and plain. Private notes stay in the admin dashboard.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-5" onSubmit={submitClient}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="client-first-name" label="First name" value={draft.firstName} onChange={(value) => setDraft((current) => ({ ...current, firstName: value }))} />
              <Field id="client-last-name" label="Last name" value={draft.lastName} onChange={(value) => setDraft((current) => ({ ...current, lastName: value }))} />
              <Field id="client-phone" label="Phone" value={draft.phone} onChange={(value) => setDraft((current) => ({ ...current, phone: value }))} />
              <Field id="client-email" label="Email" type="email" value={draft.email} onChange={(value) => setDraft((current) => ({ ...current, email: value }))} />
              <Field id="client-birthday" label="Birthday" type="date" value={draft.birthday} onChange={(value) => setDraft((current) => ({ ...current, birthday: value }))} />
              <Field id="client-skin-type" label="Skin type" value={draft.skinType} onChange={(value) => setDraft((current) => ({ ...current, skinType: value }))} />
            </div>
            <TextAreaField id="client-concerns" label="Skin concerns" value={draft.skinConcerns} onChange={(value) => setDraft((current) => ({ ...current, skinConcerns: value }))} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextAreaField id="client-allergies" label="Allergies" value={draft.allergies} onChange={(value) => setDraft((current) => ({ ...current, allergies: value }))} />
              <TextAreaField id="client-routine" label="Current skincare routine" value={draft.currentSkincareRoutine} onChange={(value) => setDraft((current) => ({ ...current, currentSkincareRoutine: value }))} />
            </div>
            <TextAreaField id="client-notes" label="Customer notes" value={draft.notes} onChange={(value) => setDraft((current) => ({ ...current, notes: value }))} />
            <TextAreaField id="client-private-notes" label="Private notes" value={draft.internalNotes} onChange={(value) => setDraft((current) => ({ ...current, internalNotes: value }))} />
            <TextAreaField id="client-follow-up" label="Recommended follow-up" value={draft.recommendedFollowUp} onChange={(value) => setDraft((current) => ({ ...current, recommendedFollowUp: value }))} />
            <div className="flex items-center justify-between rounded-[1.4rem] bg-surface-50 p-4">
              <div>
                <p className="font-semibold text-ink-900">Flag customer</p>
                <p className="text-sm text-ink-700/65">Use for important private follow-up.</p>
              </div>
              <Switch
                checked={draft.isFlagged}
                onCheckedChange={(value) => setDraft((current) => ({ ...current, isFlagged: value }))}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingClient ? "Save changes" : "Add customer"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ id, label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function TextAreaField({ id, label, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ProfileTile({ label, value }) {
  return (
    <div className="rounded-[1.5rem] bg-surface-50 p-4">
      <p className="text-sm text-ink-700/65">{label}</p>
      <div className="mt-2 text-lg font-semibold text-ink-900">{value}</div>
    </div>
  );
}

function ProfilePanel({ title, value }) {
  return (
    <div className="rounded-[1.6rem] border border-surface-100 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-ink-700/75">{value}</p>
    </div>
  );
}

function HistorySection({ appointments }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
          Booking history
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-ink-900">Visits and status</h3>
      </div>
      <div className="grid gap-4">
        {appointments.length ? (
          appointments.map((appointment) => (
            <div key={appointment._id} className="rounded-[1.5rem] border border-surface-100 bg-surface-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900">{appointment.serviceSnapshot.name}</p>
                  <p className="text-sm text-ink-700/70">{formatAppointmentLabel(appointment.startAt)}</p>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-700/70">No booking history yet.</p>
        )}
      </div>
    </div>
  );
}

function IntakeSection({ appointments }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
          Intake history
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-ink-900">Past intake answers</h3>
      </div>
      {appointments.length ? (
        <div className="grid gap-4">
          {appointments.map((appointment) => {
            const answers = appointment.intakeAnswers || {};
            return (
              <div key={appointment._id} className="rounded-[1.5rem] border border-surface-100 bg-white p-4">
                <p className="font-semibold text-ink-900">
                  {appointment.serviceSnapshot.name} - {formatAppointmentLabel(appointment.startAt)}
                </p>
                <div className="mt-3 grid gap-2 text-sm text-ink-700/75 md:grid-cols-2">
                  <p>Skin type: {answers.skinType || "Not answered"}</p>
                  <p>Concerns: {answers.skinConcerns || "Not answered"}</p>
                  <p>Allergies: {answers.allergies || "Not answered"}</p>
                  <p>Retinol: {answers.retinolUse || "Not answered"}</p>
                  <p>Accutane: {answers.accutaneUse || "Not answered"}</p>
                  <p>Recent waxing: {answers.recentWaxing || "Not answered"}</p>
                  <p>Recent peel: {answers.recentChemicalPeels || "Not answered"}</p>
                  <p>Medications/conditions: {answers.medicationsOrConditions || "Not answered"}</p>
                  <p>Consent to contact: {answers.consentToContact ? "Yes" : "No"}</p>
                  <p>Goals: {answers.appointmentGoals || "Not answered"}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-ink-700/70">No intake answers have been saved yet.</p>
      )}
    </div>
  );
}
