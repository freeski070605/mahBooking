import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, RefreshCcw, UserRound } from "lucide-react";
import { appointmentsApi, settingsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatAppointmentLabel, formatLongDate, getErrorMessage } from "@/lib/utils";
import { PageIntro } from "@/components/shared/PageIntro";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingBlock } from "@/components/shared/LoadingBlock";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export function AccountPage() {
  const { user, isAuthenticated, isAdmin, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState(null);

  const appointmentsQuery = useQuery({
    queryKey: ["account-appointments"],
    queryFn: () => appointmentsApi.list(),
    enabled: isAuthenticated && !isAdmin,
    select: (data) => data.appointments,
  });

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  });

  const slotsQuery = useQuery({
    queryKey: [
      "reschedule-slots",
      rescheduleTarget?._id,
      typeof rescheduleTarget?.serviceId === "object"
        ? rescheduleTarget?.serviceId?._id
        : rescheduleTarget?.serviceId,
      rescheduleDate,
    ],
    enabled: Boolean(rescheduleTarget && rescheduleDate),
    queryFn: () =>
      appointmentsApi.slots({
        serviceId:
          typeof rescheduleTarget.serviceId === "object"
            ? rescheduleTarget.serviceId._id
            : rescheduleTarget.serviceId,
        date: rescheduleDate,
      }),
  });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload) => login(payload),
    onSuccess: (nextUser) => {
      toast.success("Signed in");
      if (nextUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate(location.state?.from?.pathname || "/account");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to sign in."));
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload) => register(payload),
    onSuccess: () => {
      toast.success("Account created");
      navigate("/account");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to create account."));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (appointmentId) =>
      appointmentsApi.update(appointmentId, { status: "canceled" }),
    onSuccess: () => {
      toast.success("Appointment canceled");
      queryClient.invalidateQueries({ queryKey: ["account-appointments"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to cancel this appointment."));
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ appointmentId, date, startTime }) =>
      appointmentsApi.update(appointmentId, { date, startTime }),
    onSuccess: () => {
      toast.success("Appointment rescheduled");
      setRescheduleTarget(null);
      setRescheduleDate("");
      setRescheduleSlot(null);
      queryClient.invalidateQueries({ queryKey: ["account-appointments"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to reschedule this appointment."));
    },
  });

  const appointments = appointmentsQuery.data || [];
  const now = new Date();
  const upcoming = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          new Date(appointment.startAt) >= now && appointment.status !== "canceled",
      ),
    [appointments, now],
  );
  const past = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          new Date(appointment.startAt) < now || appointment.status === "canceled",
      ),
    [appointments, now],
  );

  const today = new Date().toISOString().split("T")[0];

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAuthenticated) {
    return (
      <div className="page-shell grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <PageIntro
            eyebrow="Client account"
            title="Sign in to keep upcoming visits, past appointments, and changes in one place."
            description="Create an account if you'd like an easier way to review appointment details or request eligible updates online."
          />
          <Card className="bg-ink-900 text-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                <UserRound className="h-5 w-5" />
              </div>
              <h2 className="font-display text-4xl">Everything stays close at hand.</h2>
              <p className="text-sm leading-7 text-white/75">
                Use your account to revisit appointment details, track status,
                and request changes inside the allowed window.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="login">
              <TabsList>
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="register">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form
                  className="space-y-4"
                  onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))}
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" {...loginForm.register("email")} />
                    {loginForm.formState.errors.email ? (
                      <p className="text-sm text-rose-600">
                        {loginForm.formState.errors.email.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      {...loginForm.register("password")}
                    />
                    {loginForm.formState.errors.password ? (
                      <p className="text-sm text-rose-600">
                        {loginForm.formState.errors.password.message}
                      </p>
                    ) : null}
                  </div>
                  <Button type="submit" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form
                  className="space-y-4"
                  onSubmit={registerForm.handleSubmit((values) => registerMutation.mutate(values))}
                >
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full name</Label>
                    <Input id="register-name" {...registerForm.register("name")} />
                    {registerForm.formState.errors.name ? (
                      <p className="text-sm text-rose-600">
                        {registerForm.formState.errors.name.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input id="register-email" type="email" {...registerForm.register("email")} />
                      {registerForm.formState.errors.email ? (
                        <p className="text-sm text-rose-600">
                          {registerForm.formState.errors.email.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Phone</Label>
                      <Input id="register-phone" {...registerForm.register("phone")} />
                      {registerForm.formState.errors.phone ? (
                        <p className="text-sm text-rose-600">
                          {registerForm.formState.errors.phone.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password ? (
                      <p className="text-sm text-rose-600">
                        {registerForm.formState.errors.password.message}
                      </p>
                    ) : null}
                  </div>
                  <Button type="submit" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-10">
      <PageIntro
        eyebrow="Your account"
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}.`}
        description="Review upcoming visits, check your appointment history, and request changes while they're still inside the allowed window."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-ink-700/65">Upcoming appointments</p>
            <div className="text-3xl font-semibold text-ink-900">{upcoming.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-ink-700/65">Past appointments</p>
            <div className="text-3xl font-semibold text-ink-900">{past.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-ink-700/65">Online change window</p>
            <div className="text-3xl font-semibold text-ink-900">
              {settingsQuery.data?.settings?.bookingSettings?.allowClientRescheduleHours || 24} hrs
            </div>
          </CardContent>
        </Card>
      </div>

      {appointmentsQuery.isLoading ? (
        <div className="grid gap-5">
          {[1, 2].map((item) => (
            <LoadingBlock key={item} lines={4} />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcoming.length ? (
              <div className="grid gap-5">
                {upcoming.map((appointment) => (
                  <Card key={appointment._id}>
                    <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                            {appointment.serviceSnapshot.category}
                          </p>
                          <StatusBadge status={appointment.status} />
                        </div>
                        <h2 className="text-2xl font-semibold text-ink-900">
                          {appointment.serviceSnapshot.name}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-sm text-ink-700/70">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {formatLongDate(appointment.startAt)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            {formatAppointmentLabel(appointment.startAt).split("• ")[1]}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setRescheduleTarget(appointment);
                            setRescheduleDate(appointment.appointmentDate);
                            setRescheduleSlot(null);
                          }}
                        >
                          <RefreshCcw className="h-4 w-4" />
                          Reschedule
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                You can still contact the business directly if you need help outside the online cancellation window.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep appointment</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => cancelMutation.mutate(appointment._id)}
                              >
                                Cancel appointment
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title="You don't have any upcoming appointments."
                description="Your next appointment will appear here with timing, status, and change options."
              />
            )}
          </TabsContent>

          <TabsContent value="history">
            {past.length ? (
              <div className="grid gap-5">
                {past.map((appointment) => (
                  <Card key={appointment._id}>
                    <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-semibold text-ink-900">
                            {appointment.serviceSnapshot.name}
                          </h2>
                          <StatusBadge status={appointment.status} />
                        </div>
                        <p className="mt-2 text-sm text-ink-700/70">
                          {formatAppointmentLabel(appointment.startAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No appointment history yet."
                description="Past appointments and canceled visits will show up here once you have them."
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog
        open={Boolean(rescheduleTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRescheduleTarget(null);
            setRescheduleDate("");
            setRescheduleSlot(null);
          }
        }}
      >
        {rescheduleTarget ? (
          <DialogContent className="w-[min(92vw,720px)]">
            <DialogHeader>
              <DialogTitle>Reschedule appointment</DialogTitle>
              <DialogDescription>
                Choose a new date and time for {rescheduleTarget.serviceSnapshot.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reschedule-date">New date</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  min={today}
                  value={rescheduleDate}
                  onChange={(event) => {
                    setRescheduleDate(event.target.value);
                    setRescheduleSlot(null);
                  }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {(slotsQuery.data?.slots || []).map((slot) => (
                  <button
                    key={slot.startAt}
                    type="button"
                    onClick={() => setRescheduleSlot(slot)}
                    className={`rounded-[1.25rem] border px-4 py-4 text-sm font-semibold transition ${
                      rescheduleSlot?.startAt === slot.startAt
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
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() =>
                    rescheduleMutation.mutate({
                      appointmentId: rescheduleTarget._id,
                      date: rescheduleDate,
                      startTime: rescheduleSlot?.startTime,
                    })
                  }
                  disabled={!rescheduleSlot || rescheduleMutation.isPending}
                >
                  {rescheduleMutation.isPending ? "Saving..." : "Save new time"}
                </Button>
                <Button variant="secondary" onClick={() => setRescheduleTarget(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
