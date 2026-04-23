import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flag, Users } from "lucide-react";
import { clientsApi } from "@/lib/api";
import { formatAppointmentLabel } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

export function AdminClientsPage() {
  const [selectedClientId, setSelectedClientId] = useState("");

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.list(),
    select: (data) => data.clients,
  });

  useEffect(() => {
    if (!selectedClientId && clientsQuery.data?.length) {
      setSelectedClientId(clientsQuery.data[0]._id);
    }
  }, [clientsQuery.data, selectedClientId]);

  const clientDetailQuery = useQuery({
    queryKey: ["client-detail", selectedClientId],
    enabled: Boolean(selectedClientId),
    queryFn: () => clientsApi.get(selectedClientId),
  });

  const selectedClient = clientDetailQuery.data?.client;
  const selectedAppointments = clientDetailQuery.data?.appointments || [];

  if (!clientsQuery.data?.length) {
    return (
      <EmptyState
        icon={Users}
        title="No clients yet"
        description="Client records will appear here as appointments are created and completed."
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-surface-600">
              Clients
            </p>
            <h1 className="mt-2 font-display text-5xl text-ink-900">Client relationships</h1>
            <p className="mt-3 text-sm leading-7 text-ink-700/70">
              See who has visited, keep notes handy, and notice flags or no-show patterns early.
            </p>
          </div>
          <div className="grid gap-3">
            {clientsQuery.data.map((client) => (
              <button
                key={client._id}
                type="button"
                onClick={() => setSelectedClientId(client._id)}
                className={`rounded-[1.5rem] border p-4 text-left transition ${
                  selectedClientId === client._id
                    ? "border-surface-500 bg-surface-50"
                    : "border-surface-100 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900">{client.name}</p>
                    <p className="text-sm text-ink-700/70">{client.email || client.phone}</p>
                  </div>
                  {client.isFlagged ? (
                    <div className="flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                      <Flag className="h-3 w-3" />
                      Flagged
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-700/65">
                  <span>{client.appointmentCount || 0} visits</span>
                  <span>{client.upcomingCount || 0} upcoming</span>
                  <span>{client.noShowCount || 0} no-shows</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-6 p-6">
          {selectedClient ? (
            <>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="text-3xl font-semibold text-ink-900">{selectedClient.name}</h2>
                  <p className="mt-2 text-sm text-ink-700/70">{selectedClient.email}</p>
                  <p className="text-sm text-ink-700/70">{selectedClient.phone}</p>
                </div>
                {selectedClient.isFlagged ? (
                  <div className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">
                    Client flagged
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] bg-surface-50 p-4">
                  <p className="text-sm text-ink-700/65">Appointments</p>
                  <div className="mt-2 text-3xl font-semibold text-ink-900">
                    {selectedAppointments.length}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-surface-50 p-4">
                  <p className="text-sm text-ink-700/65">No-shows</p>
                  <div className="mt-2 text-3xl font-semibold text-ink-900">
                    {selectedClient.noShowCount || 0}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-surface-50 p-4">
                  <p className="text-sm text-ink-700/65">Last appointment</p>
                  <div className="mt-2 text-lg font-semibold text-ink-900">
                    {selectedClient.lastAppointmentAt
                      ? formatAppointmentLabel(selectedClient.lastAppointmentAt)
                      : "No visits yet"}
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-[1.6rem] border border-surface-100 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                    Client notes
                  </p>
                  <p className="mt-3 text-sm leading-7 text-ink-700/75">
                    {selectedClient.notes || "No client notes yet."}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-surface-100 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                    Internal notes
                  </p>
                  <p className="mt-3 text-sm leading-7 text-ink-700/75">
                    {selectedClient.internalNotes || "No internal notes yet."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                    Appointment history
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-ink-900">Visits and status</h3>
                </div>
                <div className="grid gap-4">
                  {selectedAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="rounded-[1.5rem] border border-surface-100 bg-surface-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-900">
                            {appointment.serviceSnapshot.name}
                          </p>
                          <p className="text-sm text-ink-700/70">
                            {formatAppointmentLabel(appointment.startAt)}
                          </p>
                        </div>
                        <StatusBadge status={appointment.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
