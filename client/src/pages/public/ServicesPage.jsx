import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { servicesApi } from "@/lib/api";
import { formatCurrency, formatDuration, uniqueValues } from "@/lib/utils";
import { PageIntro } from "@/components/shared/PageIntro";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingBlock } from "@/components/shared/LoadingBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ServicesPage() {
  const [category, setCategory] = useState("All");

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesApi.list(),
    select: (data) => data.services,
  });

  const services = servicesQuery.data || [];
  const categories = useMemo(() => ["All", ...uniqueValues(services, "category")], [services]);
  const filteredServices =
    category === "All"
      ? services
      : services.filter((service) => service.category === category);

  return (
    <div className="page-shell space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageIntro
          eyebrow="Service menu"
          title="Services chosen with healthy hair and polished finishes in mind."
          description="Browse the current menu, compare timing and pricing, and choose the appointment that fits the care or look you're after."
        />
        <div className="w-full max-w-xs">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {servicesQuery.isLoading ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <LoadingBlock key={item} lines={4} />
          ))}
        </div>
      ) : filteredServices.length ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service._id} className="overflow-hidden">
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
                    <h2 className="mt-2 text-2xl font-semibold text-ink-900">{service.name}</h2>
                  </div>
                  <p className="text-lg font-semibold text-surface-700">
                    {formatCurrency(service.price)}
                  </p>
                </div>
                <p className="text-sm leading-7 text-ink-700/75">{service.description}</p>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 text-sm text-ink-700/65">
                    <p>{formatDuration(service.durationMinutes)}</p>
                    <p>{service.bufferMinutes} min buffer</p>
                  </div>
                  <Button asChild>
                    <Link to="/booking" state={{ serviceId: service._id }}>
                      Book now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing matches that filter yet."
          description="Try another category to see the full service menu."
        />
      )}
    </div>
  );
}
