import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { galleryApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const emptyGalleryItem = {
  title: "",
  caption: "",
  category: "Signature Styling",
  imageUrl: "",
  imagePublicId: "",
  isFeatured: false,
  displayOrder: 0,
};

export function AdminGalleryPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [draft, setDraft] = useState(emptyGalleryItem);

  const galleryQuery = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: () => galleryApi.list(),
    select: (data) => data.gallery,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => galleryApi.create(payload),
    onSuccess: () => {
      toast.success("Gallery image added");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      setOpen(false);
      setDraft(emptyGalleryItem);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to save gallery item.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => galleryApi.update(id, payload),
    onSuccess: () => {
      toast.success("Gallery item updated");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      setOpen(false);
      setEditingItem(null);
      setDraft(emptyGalleryItem);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to update gallery item.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => galleryApi.remove(id),
    onSuccess: () => {
      toast.success("Gallery image deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to delete image.")),
  });

  function openCreate() {
    setEditingItem(null);
    setDraft(emptyGalleryItem);
    setOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setDraft({ ...item });
    setOpen(true);
  }

  function submitGallery(event) {
    event.preventDefault();

    if (!draft.category || !draft.imageUrl) {
      toast.error("Please upload an image and choose a category.");
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, payload: draft });
    } else {
      createMutation.mutate(draft);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-surface-600">
              Gallery
            </p>
            <h1 className="mt-2 font-display text-5xl text-ink-900">Manage your visual portfolio</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700/70">
              Update your brand imagery with large thumbnails, clear captions, and simple featured controls.
            </p>
          </div>
          <Button onClick={openCreate}>
            <ImagePlus className="h-4 w-4" />
            Add gallery image
          </Button>
        </CardContent>
      </Card>

      {galleryQuery.data?.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {galleryQuery.data.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title || item.category}
                className="aspect-[4/5] w-full object-cover"
              />
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                      {item.category}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-ink-900">
                      {item.title || "Untitled image"}
                    </h2>
                  </div>
                  {item.isFeatured ? <Badge variant="success">Featured</Badge> : null}
                </div>
                <p className="text-sm leading-7 text-ink-700/75">{item.caption}</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => openEdit(item)}>
                    Edit
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
                        <AlertDialogTitle>Delete this gallery image?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This removes the image from your gallery and clears the file from cloud storage when configured.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep image</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(item._id)}>
                          Delete image
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
          icon={ImagePlus}
          title="No gallery images yet"
          description="Upload a few images to make the brand feel established right away on the public site."
          actionLabel="Upload image"
          onAction={openCreate}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit gallery item" : "Add a gallery image"}</DialogTitle>
            <DialogDescription>
              Keep captions short and elegant. Visual content should feel easy to manage, not technical.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6" onSubmit={submitGallery}>
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <ImageUploader
                value={draft.imageUrl}
                publicId={draft.imagePublicId}
                uploadType="gallery"
                onChange={(image) => setDraft((current) => ({ ...current, ...image }))}
              />
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="gallery-title">Title</Label>
                  <Input
                    id="gallery-title"
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gallery-category">Category</Label>
                  <Input
                    id="gallery-category"
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, category: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gallery-caption">Caption</Label>
                  <Textarea
                    id="gallery-caption"
                    value={draft.caption}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, caption: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gallery-order">Display order</Label>
                    <Input
                      id="gallery-order"
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
                  <div className="flex items-center justify-between rounded-[1.4rem] bg-surface-50 p-4">
                    <div>
                      <p className="font-semibold text-ink-900">Featured image</p>
                      <p className="text-sm text-ink-700/65">Show on the homepage preview.</p>
                    </div>
                    <Switch
                      checked={draft.isFeatured}
                      onCheckedChange={(value) =>
                        setDraft((current) => ({ ...current, isFeatured: value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? "Save changes" : "Add image"}
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
