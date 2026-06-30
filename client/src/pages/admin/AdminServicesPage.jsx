import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { servicesApi } from "@/lib/api";
import { formatCurrency, formatDuration, formatServicePrice, getErrorMessage } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const emptyService = {
  name: "",
  category: "Facials",
  shortDescription: "",
  fullDescription: "",
  description: "",
  price: 85,
  priceType: "fixed",
  durationMinutes: 60,
  bufferMinutes: 15,
  imageUrl: "",
  imagePublicId: "",
  requiresDeposit: false,
  depositAmount: 0,
  prepInstructions: "",
  aftercareInstructions: "",
  contraindications: "",
  consultationRequired: false,
  isActive: true,
  isPublished: true,
  displayOrder: 0,
  featured: false,
};

export function AdminServicesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [draft, setDraft] = useState(emptyService);

  const servicesQuery = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => servicesApi.list({ scope: "all" }),
    select: (data) => data.services,
  });

  const orderedServices = useMemo(
    () => (servicesQuery.data || []).slice().sort((a, b) => a.displayOrder - b.displayOrder),
    [servicesQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: (payload) => servicesApi.create(payload),
    onSuccess: () => {
      toast.success("Service added");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setOpen(false);
      setDraft(emptyService);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to save service.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => servicesApi.update(id, payload),
    onSuccess: () => {
      toast.success("Service updated");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setOpen(false);
      setEditingService(null);
      setDraft(emptyService);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to update service.")),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => servicesApi.toggle(id),
    onSuccess: () => {
      toast.success("Service status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to update status.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => servicesApi.remove(id),
    onSuccess: () => {
      toast.success("Service deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to delete service.")),
  });

  function openCreate() {
    setEditingService(null);
    setDraft(emptyService);
    setOpen(true);
  }

  function openEdit(service) {
    setEditingService(service);
    setDraft({
      ...emptyService,
      ...service,
      shortDescription: service.shortDescription || service.description || "",
      fullDescription: service.fullDescription || service.description || "",
    });
    setOpen(true);
  }

  function submitService(event) {
    event.preventDefault();

    if (!draft.name || !draft.category || !draft.shortDescription) {
      toast.error("Please fill in the service name, category, and short description.");
      return;
    }

    const payload = {
      ...draft,
      description: draft.shortDescription,
      depositAmount: draft.requiresDeposit ? Number(draft.depositAmount || 0) : 0,
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService._id, payload });
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
              Services
            </p>
            <h1 className="mt-2 font-display text-5xl text-ink-900">Manage the service menu</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700/70">
              Keep images, pricing, timing, deposits, prep notes, and aftercare simple to update as the service menu evolves.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add service
          </Button>
        </CardContent>
      </Card>

      {orderedServices.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {orderedServices.map((service) => (
            <Card key={service._id} className="overflow-hidden">
              <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
                <img
                  src={service.imageUrl || "https://placehold.co/900x1200/f7ede7/372d2a?text=No+Image"}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                        {service.category}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-ink-900">
                        {service.name}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={service.isActive ? "success" : "muted"}>
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant={service.isPublished ? "success" : "muted"}>
                        {service.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-ink-700/75">
                    {service.shortDescription || service.description}
                  </p>
                  <div className="grid gap-3 text-sm text-ink-700/70 sm:grid-cols-3">
                    <div>
                      <p className="font-semibold text-ink-900">{formatServicePrice(service)}</p>
                      <p>Price</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900">
                        {formatDuration(service.durationMinutes)}
                      </p>
                      <p>Duration</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900">
                        {service.requiresDeposit ? formatCurrency(service.depositAmount || 0) : "No"}
                      </p>
                      <p>Deposit</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={() => openEdit(service)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleMutation.mutate(service._id)}
                    >
                      {service.isActive ? "Deactivate" : "Reactivate"}
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
                          <AlertDialogTitle>Delete this service?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Deleting is permanent and only works when there are no future appointments attached.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep service</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(service._id)}>
                            Delete service
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No services yet"
          description="Start by adding your first service with a price, duration, and image so clients can book with confidence."
          actionLabel="Add first service"
          onAction={openCreate}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit service" : "Add a new service"}</DialogTitle>
            <DialogDescription>
              Use plain, client-friendly wording. Everything here can be changed later as the final menu comes together.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6" onSubmit={submitService}>
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <ImageUploader
                value={draft.imageUrl}
                publicId={draft.imagePublicId}
                uploadType="service"
                onChange={(image) => setDraft((current) => ({ ...current, ...image }))}
              />
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="service-name">Service name</Label>
                  <Input
                    id="service-name"
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="service-category">Category</Label>
                    <Input
                      id="service-category"
                      value={draft.category}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, category: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price display</Label>
                    <Select
                      value={draft.priceType}
                      onValueChange={(value) =>
                        setDraft((current) => ({ ...current, priceType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed price</SelectItem>
                        <SelectItem value="starting_at">Starting at</SelectItem>
                        <SelectItem value="tbd">TBD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-price">Price</Label>
                    <Input
                      id="service-price"
                      type="number"
                      disabled={draft.priceType === "tbd"}
                      placeholder="Example: 75"
                      value={draft.price}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, price: Number(event.target.value) }))
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="service-duration">Duration (minutes)</Label>
                    <Input
                      id="service-duration"
                      type="number"
                      value={draft.durationMinutes}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          durationMinutes: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-buffer">Buffer (minutes)</Label>
                    <Input
                      id="service-buffer"
                      type="number"
                      value={draft.bufferMinutes}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          bufferMinutes: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-order">Display order</Label>
                    <Input
                      id="service-order"
                      type="number"
                      value={draft.displayOrder}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          displayOrder: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-short-description">Short description</Label>
                  <Textarea
                    id="service-short-description"
                    placeholder="Example: Great for dry or dull skin"
                    value={draft.shortDescription}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, shortDescription: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-full-description">Full description</Label>
                  <Textarea
                    id="service-full-description"
                    placeholder="Describe what this service includes and who it is best for."
                    value={draft.fullDescription}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, fullDescription: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-[1.4rem] bg-surface-50 p-4">
                    <div>
                      <p className="font-semibold text-ink-900">Deposit required</p>
                      <p className="text-sm text-ink-700/65">Show a deposit amount for this service.</p>
                    </div>
                    <Switch
                      checked={draft.requiresDeposit}
                      onCheckedChange={(value) =>
                        setDraft((current) => ({ ...current, requiresDeposit: value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-deposit">Deposit amount</Label>
                    <Input
                      id="service-deposit"
                      type="number"
                      disabled={!draft.requiresDeposit}
                      value={draft.depositAmount}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          depositAmount: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="service-prep">Prep instructions</Label>
                    <Textarea
                      id="service-prep"
                      placeholder="Example: Avoid retinol 3-5 days before appointment"
                      value={draft.prepInstructions}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, prepInstructions: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-aftercare">Aftercare instructions</Label>
                    <Textarea
                      id="service-aftercare"
                      placeholder="Example: Drink water and avoid heavy makeup after your service"
                      value={draft.aftercareInstructions}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, aftercareInstructions: event.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-contraindications">Contraindications or important warnings</Label>
                  <Textarea
                    id="service-contraindications"
                    placeholder="Example: Recent peel, Accutane use, product allergies, or sensitive skin concerns"
                    value={draft.contraindications}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, contraindications: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-[1.4rem] bg-surface-50 p-4">
                    <div>
                      <p className="font-semibold text-ink-900">Consultation required</p>
                      <p className="text-sm text-ink-700/65">Mark services that need a consult first.</p>
                    </div>
                    <Switch
                      checked={draft.consultationRequired}
                      onCheckedChange={(value) =>
                        setDraft((current) => ({ ...current, consultationRequired: value }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-[1.4rem] bg-surface-50 p-4">
                    <div>
                      <p className="font-semibold text-ink-900">Published</p>
                      <p className="text-sm text-ink-700/65">Show this service publicly.</p>
                    </div>
                    <Switch
                      checked={draft.isPublished}
                      onCheckedChange={(value) =>
                        setDraft((current) => ({ ...current, isPublished: value }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-[1.4rem] bg-surface-50 p-4">
                    <div>
                      <p className="font-semibold text-ink-900">Featured service</p>
                      <p className="text-sm text-ink-700/65">Show this on the homepage.</p>
                    </div>
                    <Switch
                      checked={draft.featured}
                      onCheckedChange={(value) =>
                        setDraft((current) => ({ ...current, featured: value }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-[1.4rem] bg-surface-50 p-4">
                    <div>
                      <p className="font-semibold text-ink-900">Active</p>
                      <p className="text-sm text-ink-700/65">Clients can book this service.</p>
                    </div>
                    <Switch
                      checked={draft.isActive}
                      onCheckedChange={(value) =>
                        setDraft((current) => ({ ...current, isActive: value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingService ? "Save changes" : "Add service"}
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
