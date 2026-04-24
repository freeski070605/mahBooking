import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";
import { appointmentsApi, servicesApi, settingsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  formatAppointmentLabel,
  formatCurrency,
  formatDuration,
  formatLongDate,
  getErrorMessage,
} from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingBlock } from "@/components/shared/LoadingBlock";
import { PageIntro } from "@/components/shared/PageIntro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const bookingSchema = z.object({
  clientName: z.string().trim().min(2, "Please enter your name."),
  clientEmail: z.string().trim().email("Enter a valid email."),
  clientPhone: z.string().trim().min(7, "Enter a valid phone number."),
  notes: z.string().trim().optional(),
});

const steps = [
  "Choose service",
  "Choose date",
  "Your details",
  "Confirmation",
];

export function BookingPage() {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesApi.list(),
    select: (data) => data.services,
  });

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  });

  useEffect(() => {
    if (!servicesQuery.data?.length) {
      return;
    }

    const presetServiceId = location.state?.serviceId;

    if (presetServiceId) {
      const match = servicesQuery.data.find(
        (item) => item._id === presetServiceId,
      );

      if (match) {
        setSelectedService(match);
        setStep(2);
      }
    }
  }, [location.state, servicesQuery.data]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      clientName: user?.name || "",
      clientEmail: user?.email || "",
      clientPhone: user?.phone || "",
      notes: "",
    },
  });

  useEffect(() => {
    reset({
      clientName: user?.name || "",
      clientEmail: user?.email || "",
      clientPhone: user?.phone || "",
      notes: "",
    });
  }, [reset, user]);

  const slotsQuery = useQuery({
    queryKey: ["booking-slots", selectedService?._id, selectedDate],
    enabled: Boolean(selectedService && selectedDate),
    queryFn: () =>
      appointmentsApi.slots({
        serviceId: selectedService._id,
        date: selectedDate,
      }),
  });

  const bookMutation = useMutation({
    mutationFn: (payload) => appointmentsApi.create(payload),
    onSuccess: (data) => {
      setConfirmedAppointment(data.appointment);
      setStep(4);
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment request submitted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "We couldn't complete your booking."));
    },
  });

  const availableSlots = slotsQuery.data?.slots || [];
  const confirmationMessage =
    settingsQuery.data?.settings?.bookingSettings?.confirmationMessage ||
    "Your appointment request has been received.";
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  function submitBooking(values) {
    if (!selectedService || !selectedDate || !selectedSlot) {
      toast.error("Please choose a service, date, and time first.");
      return;
    }

    bookMutation.mutate({
      ...values,
      serviceId: selectedService._id,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      notes: values.notes || "",
    });
  }

  return (
    <div className="page-shell space-y-10">
      <div className="space-y-6">
        <PageIntro
          eyebrow="Booking"
          title="Book in a few easy steps."
          description="Choose your service, pick from live availability, and send your request without the usual back-and-forth."
        />
        <div className="glass-panel p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            {steps.map((label, index) => (
              <div
                key={label}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  step >= index + 1
                    ? "bg-surface-500 text-white"
                    : "bg-surface-100 text-ink-700/70"
                }`}
              >
                {index + 1}. {label}
              </div>
            ))}
          </div>
          <Progress value={(step / 4) * 100} />
        </div>
      </div>

      {step === 1 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-4xl text-ink-900">
              Choose your service
            </h2>
            <p className="text-sm text-ink-700/65">Select the appointment that fits your visit</p>
          </div>
          {servicesQuery.isLoading ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <LoadingBlock key={item} lines={4} />
              ))}
            </div>
          ) : !servicesQuery.data?.length ? (
            <EmptyState
              title="No services are bookable right now"
              description="The service menu is being updated. Please check back soon or reach out to the studio directly."
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {servicesQuery.data.map((service) => (
                <button
                  key={service._id}
                  type="button"
                  onClick={() => {
                    setSelectedService(service);
                    setSelectedSlot(null);
                    setStep(2);
                  }}
                  className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 text-left shadow-panel transition hover:-translate-y-1"
                >
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="aspect-[4/4.8] w-full object-cover"
                  />
                  <div className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                          {service.category}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-ink-900">
                          {service.name}
                        </h3>
                      </div>
                      <p className="text-base font-semibold text-surface-700">
                        {formatCurrency(service.price)}
                      </p>
                    </div>
                    <p className="text-sm leading-7 text-ink-700/75">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-ink-700/65">
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {formatDuration(service.durationMinutes)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {service.bufferMinutes} min buffer
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {step === 2 && selectedService ? (
        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <Card>
            <CardContent className="space-y-5 p-6">
              <Button variant="ghost" className="px-0" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                Back to services
              </Button>
              <img
                src={selectedService.imageUrl}
                alt={selectedService.name}
                className="aspect-[4/4.7] w-full rounded-[1.6rem] object-cover"
              />
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                  {selectedService.category}
                </p>
                <h2 className="text-3xl font-semibold text-ink-900">
                  {selectedService.name}
                </h2>
                <p className="text-sm leading-7 text-ink-700/75">
                  {selectedService.description}
                </p>
                <div className="flex items-center justify-between text-sm text-ink-700/65">
                  <span>{formatDuration(selectedService.durationMinutes)}</span>
                  <span>{formatCurrency(selectedService.price)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <h2 className="font-display text-4xl text-ink-900">
                  Choose your date and time
                </h2>
                <p className="text-sm leading-6 text-ink-700/70">
                  Only live availability is shown, based on studio hours,
                  breaks, blocked time, and existing appointments.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-date">Select a date</Label>
                <Input
                  id="booking-date"
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSelectedSlot(null);
                  }}
                />
              </div>
              {slotsQuery.isLoading ? <LoadingBlock lines={4} /> : null}
              {selectedDate && !slotsQuery.isLoading ? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-ink-900">
                    {availableSlots.length
                      ? `Available times for ${formatLongDate(selectedDate)}`
                      : `No times are open for ${formatLongDate(selectedDate)}.`}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.startAt}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setStep(3);
                        }}
                        className={`rounded-[1.4rem] border px-4 py-4 text-sm font-semibold transition ${
                          selectedSlot?.startAt === slot.startAt
                            ? "border-surface-500 bg-surface-500 text-white"
                            : "border-surface-200 bg-white text-ink-900 hover:bg-surface-50"
                        }`}
                      >
                        {new Date(slot.startAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>
      ) : null}

      {step === 3 && selectedService && selectedSlot ? (
        <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <Card>
            <CardContent className="space-y-5 p-6">
              <Button variant="ghost" className="px-0" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" />
                Back to time selection
              </Button>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                  Appointment summary
                </p>
                <h2 className="text-2xl font-semibold text-ink-900">
                  {selectedService.name}
                </h2>
                <p className="text-sm leading-6 text-ink-700/70">
                  {formatCurrency(selectedService.price)} -{" "}
                  {formatDuration(selectedService.durationMinutes)}
                </p>
              </div>
              <div className="rounded-[1.6rem] bg-surface-50 p-4 text-sm leading-7 text-ink-700/75">
                {selectedDate ? formatLongDate(selectedDate) : ""} at{" "}
                {selectedSlot
                  ? new Date(selectedSlot.startAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <h2 className="font-display text-4xl text-ink-900">
                  Enter your details
                </h2>
                <p className="text-sm leading-6 text-ink-700/70">
                  Share your details so the studio can hold your request and
                  keep you updated.
                </p>
              </div>
              <form className="grid gap-5" onSubmit={handleSubmit(submitBooking)}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Full name</Label>
                    <Input id="clientName" {...register("clientName")} />
                    {errors.clientName ? (
                      <p className="text-sm text-rose-600">
                        {errors.clientName.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Phone</Label>
                    <Input id="clientPhone" {...register("clientPhone")} />
                    {errors.clientPhone ? (
                      <p className="text-sm text-rose-600">
                        {errors.clientPhone.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input id="clientEmail" type="email" {...register("clientEmail")} />
                  {errors.clientEmail ? (
                    <p className="text-sm text-rose-600">
                      {errors.clientEmail.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Appointment notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Anything you'd like the studio to know before your visit?"
                    {...register("notes")}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={bookMutation.isPending}>
                    {bookMutation.isPending ? "Submitting..." : "Confirm booking"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(2)}
                  >
                    Change time
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {step === 4 && confirmedAppointment ? (
        <section className="mx-auto max-w-3xl">
          <Card className="overflow-hidden bg-white/95">
            <CardContent className="space-y-6 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-surface-600">
                  Booking request received
                </p>
                <h2 className="font-display text-5xl text-ink-900">
                  Your request is in.
                </h2>
                <p className="text-base leading-7 text-ink-700/80">
                  {confirmationMessage}
                </p>
              </div>
              <div className="rounded-[1.8rem] bg-surface-50 p-6 text-left">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                      Service
                    </p>
                    <p className="mt-2 text-lg font-semibold text-ink-900">
                      {confirmedAppointment.serviceSnapshot.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                      Appointment
                    </p>
                    <p className="mt-2 text-lg font-semibold text-ink-900">
                      {formatAppointmentLabel(confirmedAppointment.startAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSelectedService(null);
                    setSelectedDate("");
                    setSelectedSlot(null);
                    setConfirmedAppointment(null);
                  }}
                >
                  Book another appointment
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Review details
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
