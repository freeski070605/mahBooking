import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, ClipboardCheck, Clock3, Inbox, Sparkles, Users } from "lucide-react";
import { dashboardApi, settingsApi } from "@/lib/api";
import { dashboardQuickActions } from "@/data/navigation";
import { formatAppointmentLabel } from "@/lib/utils";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingBlock } from "@/components/shared/LoadingBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AdminDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => dashboardApi.summary(),
  });

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  });

  const stats = dashboardQuery.data?.stats;
  const todayAppointments = dashboardQuery.data?.todayAppointments || [];
  const pendingAppointments = dashboardQuery.data?.pendingAppointments || [];
  const upcomingAppointments = dashboardQuery.data?.upcomingAppointments || [];
  const businessName = settingsQuery.data?.settings?.businessName || "MAH Esti";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-surface-600">
            Dashboard
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-5xl text-ink-900">
                {businessName} Control Center
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700/70">
                Start here for a quick look at today's schedule, what is coming up
                next, and the actions you are most likely to use.
              </p>
            </div>
            <Button asChild>
              <Link to="/admin/appointments">Open appointments</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {dashboardQuery.isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {[1, 2].map((item) => (
            <LoadingBlock key={item} lines={4} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-5">
            <MetricCard
              label="Pending booking requests"
              value={stats?.pendingCount || 0}
              helper="Requests waiting for review"
              icon={Clock3}
            />
            <MetricCard
              label="Confirmed appointments"
              value={stats?.confirmedAppointmentCount || 0}
              helper="Upcoming confirmed visits"
              icon={CheckCircle2}
            />
            <MetricCard
              label="Total customers"
              value={stats?.clientCount || 0}
              helper="Saved customer records"
              icon={Users}
            />
            <MetricCard
              label="Active services"
              value={stats?.activeServiceCount || 0}
              helper="Bookable service menu items"
              icon={Sparkles}
            />
            <MetricCard
              label="Draft services"
              value={stats?.draftServiceCount || 0}
              helper="Saved but not public yet"
              icon={ClipboardCheck}
            />
            <MetricCard
              label="New inquiries"
              value={stats?.newInquiryCount || 0}
              helper="Contact form leads"
              icon={Inbox}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            {dashboardQuickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} to={action.href}>
                  <Card className="h-full transition hover:-translate-y-1">
                    <CardContent className="space-y-4 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-ink-900">{action.label}</h2>
                        <p className="mt-2 text-sm leading-6 text-ink-700/70">
                          {action.hint}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                  Setup checklist
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink-900">
                  Launch basics
                </h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[
                  "Add your first service",
                  "Set your availability",
                  "Add contact info",
                  "Add policies",
                  "Publish your booking page",
                  "Add gallery images",
                ].map((item) => (
                  <div key={item} className="rounded-[1.25rem] bg-surface-50 p-4 text-sm font-semibold text-ink-800">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                      Pending
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-ink-900">
                      Booking requests
                    </h2>
                  </div>
                  <Button asChild variant="secondary">
                    <Link to="/admin/appointments">Review</Link>
                  </Button>
                </div>
                {pendingAppointments.length ? (
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <div key={appointment._id} className="rounded-[1.5rem] border border-surface-100 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-ink-900">{appointment.clientName}</p>
                            <p className="text-sm text-ink-700/70">
                              {appointment.serviceSnapshot.name}
                            </p>
                          </div>
                          <StatusBadge status={appointment.status} />
                        </div>
                        <p className="mt-3 text-sm text-ink-700/70">
                          {formatAppointmentLabel(appointment.startAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-ink-700/70">
                    No booking requests are waiting right now.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                      Today
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-ink-900">
                      Today's appointments
                    </h2>
                  </div>
                  <Button asChild variant="secondary">
                    <Link to="/admin/appointments">View all</Link>
                  </Button>
                </div>
                {todayAppointments.length ? (
                  <div className="space-y-4">
                    {todayAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="rounded-[1.5rem] border border-surface-100 bg-surface-50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-ink-900">{appointment.clientName}</p>
                            <p className="text-sm text-ink-700/70">
                              {appointment.serviceSnapshot.name}
                            </p>
                          </div>
                          <StatusBadge status={appointment.status} />
                        </div>
                        <p className="mt-3 text-sm text-ink-700/70">
                          {formatAppointmentLabel(appointment.startAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-ink-700/70">
                    Nothing is scheduled for today yet. This is a quiet moment to update services or upload new work.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                    Coming up
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink-900">
                    Next appointments
                  </h2>
                </div>
                {upcomingAppointments.length ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment._id} className="rounded-[1.5rem] border border-surface-100 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-ink-900">{appointment.clientName}</p>
                            <p className="text-sm text-ink-700/70">
                              {appointment.serviceSnapshot.name}
                            </p>
                          </div>
                          <StatusBadge status={appointment.status} />
                        </div>
                        <p className="mt-3 text-sm text-ink-700/70">
                          {formatAppointmentLabel(appointment.startAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-ink-700/70">
                    No upcoming appointments are in the queue right now.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
