import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Quote, ShieldCheck, Sparkles, Star } from "lucide-react";
import { galleryApi, servicesApi, settingsApi } from "@/lib/api";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { highlightFeatures, testimonials } from "@/data/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { LoadingBlock } from "@/components/shared/LoadingBlock";

export function HomePage() {
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  });

  const servicesQuery = useQuery({
    queryKey: ["featured-services"],
    queryFn: () => servicesApi.list(),
    select: (data) => data.services.filter((item) => item.featured).slice(0, 3),
  });

  const galleryQuery = useQuery({
    queryKey: ["featured-gallery"],
    queryFn: () => galleryApi.list({ featured: true }),
    select: (data) => data.gallery.slice(0, 3),
  });

  const settings = settingsQuery.data?.settings;
  const featuredServices = servicesQuery.data || [];
  const featuredGallery = galleryQuery.data || [];

  return (
    <div className="overflow-hidden">
      <section className="page-shell pb-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <Badge className="rounded-full px-4 py-2 text-[0.68rem] tracking-[0.26em]">
              Hair appointments with a premium feel
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-6xl leading-[0.95] text-ink-900 sm:text-7xl">
                Book polished beauty appointments with warmth, ease, and style.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink-700/80">
                {settings?.tagline ||
                  "A modern solo beauty studio experience for healthy hair, refined styling, and future-ready esthetician growth."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/booking">
                  Book your appointment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/services">Explore services</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {highlightFeatures.map((feature) => (
                <div
                  key={feature}
                  className="rounded-[1.6rem] border border-white/70 bg-white/80 p-4 shadow-soft"
                >
                  <Sparkles className="mb-3 h-5 w-5 text-surface-600" />
                  <p className="text-sm font-medium leading-6 text-ink-800">{feature}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="relative"
          >
            <div className="absolute inset-x-10 top-12 h-52 rounded-full bg-surface-300/35 blur-3xl" />
            <div className="glass-panel relative overflow-hidden p-4">
              <img
                src={
                  settings?.branding?.heroImageUrl ||
                  "https://placehold.co/1200x1600/f3e9df/2f2622?text=MAH+Booking"
                }
                alt="MAH Booking brand hero"
                className="aspect-[4/5] w-full rounded-[1.7rem] object-cover"
              />
              <div className="absolute bottom-8 left-8 right-8 rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-surface-600">
                      Signature experience
                    </p>
                    <p className="mt-2 font-display text-3xl text-ink-900">
                      Soft luxury with an orange glow
                    </p>
                  </div>
                  <div className="rounded-full bg-surface-500 p-3 text-white">
                    <Star className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="page-shell pt-6">
        <SectionHeading
          eyebrow="Featured services"
          title="Hair services presented with a boutique feel."
          description="Current hair offerings are front and center, while the system already leaves room for brows, facials, and future esthetician services."
        />
        {servicesQuery.isLoading ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <LoadingBlock key={item} lines={4} />
            ))}
          </div>
        ) : featuredServices.length ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {featuredServices.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <Card className="h-full overflow-hidden">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="aspect-[4/4.8] w-full object-cover"
                  />
                  <CardContent className="space-y-4 p-6">
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
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink-700/65">
                        {formatDuration(service.durationMinutes)}
                      </p>
                      <Button asChild variant="ghost">
                        <Link to="/booking" state={{ serviceId: service._id }}>
                          Book now
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="Service menu coming soon"
              description="The business owner is updating the service menu. Check back soon or reach out directly for current availability."
            />
          </div>
        )}
      </section>

      <section className="page-shell">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-ink-900 text-white">
            <CardContent className="space-y-5 p-8">
              <Badge variant="outline" className="border-white/20 text-white">
                Brand story
              </Badge>
              <h2 className="font-display text-5xl leading-none">
                Crafted for a solo beauty professional with room to grow.
              </h2>
              <p className="text-sm leading-7 text-white/75">
                {settings?.description ||
                  "MAH Booking supports the current hair service menu while already making space for esthetician services later, so the business can evolve without rebuilding the brand experience."}
              </p>
            </CardContent>
          </Card>
          {galleryQuery.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {[1, 2].map((item) => (
                <LoadingBlock key={item} lines={3} />
              ))}
            </div>
          ) : featuredGallery.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {featuredGallery.map((item) => (
                <Card key={item._id} className="overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title || item.category}
                    className="aspect-[4/5] w-full object-cover"
                  />
                  <CardContent className="space-y-2 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-surface-600">
                      {item.category}
                    </p>
                    <h3 className="text-xl font-semibold text-ink-900">
                      {item.title || item.category}
                    </h3>
                    <p className="text-sm leading-6 text-ink-700/70">{item.caption}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Gallery updates coming soon"
              description="Fresh work will appear here once new images are uploaded to the portfolio."
            />
          )}
        </div>
      </section>

      <section className="page-shell">
        <SectionHeading
          eyebrow="Policies preview"
          title="Professional expectations with a soft, clear tone."
          description="Policies are easy to review before booking so clients feel informed without feeling intimidated."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "Cancellation",
              description: settings?.policies?.cancellation,
            },
            {
              title: "Lateness",
              description: settings?.policies?.lateness,
            },
            {
              title: "Booking notes",
              description: settings?.policies?.expectations,
            },
          ].map((policy) => (
            <Card key={policy.title}>
              <CardContent className="space-y-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-100 text-surface-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-ink-900">{policy.title}</h3>
                <p className="text-sm leading-7 text-ink-700/75">{policy.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-shell pt-0">
        <SectionHeading
          eyebrow="Testimonials ready"
          title="Space for social proof and polished client feedback."
          description="The layout already supports testimonials so the brand can grow into stronger client trust over time."
          align="center"
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {testimonials.map((item) => (
            <Card key={item.name}>
              <CardContent className="space-y-4 p-6">
                <Quote className="h-8 w-8 text-surface-500" />
                <p className="text-lg leading-8 text-ink-800">{item.quote}</p>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-ink-700/55">
                  {item.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
