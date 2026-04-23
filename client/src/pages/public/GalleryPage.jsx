import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Maximize2 } from "lucide-react";
import { galleryApi } from "@/lib/api";
import { uniqueValues } from "@/lib/utils";
import { PageIntro } from "@/components/shared/PageIntro";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingBlock } from "@/components/shared/LoadingBlock";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function GalleryPage() {
  const [category, setCategory] = useState("All");
  const [activeItem, setActiveItem] = useState(null);

  const galleryQuery = useQuery({
    queryKey: ["gallery"],
    queryFn: () => galleryApi.list(),
    select: (data) => data.gallery,
  });

  const gallery = galleryQuery.data || [];
  const categories = useMemo(() => ["All", ...uniqueValues(gallery, "category")], [gallery]);
  const filteredGallery =
    category === "All"
      ? gallery
      : gallery.filter((item) => item.category === category);

  return (
    <div className="page-shell space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageIntro
          eyebrow="Gallery"
          title="Visual storytelling that feels like brand work, not a cheap grid."
          description="Featured work is presented with large imagery, soft framing, and category filters so the portfolio feels premium on every screen."
        />
        <div className="w-full max-w-xs">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter gallery" />
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

      {galleryQuery.isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <LoadingBlock key={item} lines={2} />
          ))}
        </div>
      ) : filteredGallery.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredGallery.map((item, index) => (
            <button
              key={item._id}
              type="button"
              onClick={() => setActiveItem(item)}
              className={`group overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 text-left shadow-panel transition hover:-translate-y-1 ${
                index % 3 === 0 ? "lg:row-span-2" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.title || item.category}
                  className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
                    index % 3 === 0 ? "aspect-[4/5.3]" : "aspect-[4/4.7]"
                  }`}
                />
                <div className="absolute right-4 top-4 rounded-full bg-white/85 p-3 text-ink-900 shadow-soft">
                  <Maximize2 className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
                  {item.category}
                </p>
                <h2 className="text-xl font-semibold text-ink-900">
                  {item.title || item.category}
                </h2>
                <p className="text-sm leading-6 text-ink-700/75">{item.caption}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing has been added to this gallery filter yet."
          description="Check another category to explore the full beauty portfolio."
        />
      )}

      <Dialog open={Boolean(activeItem)} onOpenChange={(open) => !open && setActiveItem(null)}>
        {activeItem ? (
          <DialogContent className="w-[min(94vw,980px)] overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title || activeItem.category}
                className="h-full min-h-[360px] w-full object-cover"
              />
              <div className="space-y-4 p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-surface-600">
                  {activeItem.category}
                </p>
                <DialogTitle className="font-display text-5xl">
                  {activeItem.title || activeItem.category}
                </DialogTitle>
                <DialogDescription className="text-base leading-7 text-ink-700/80">
                  {activeItem.caption || "Beautiful work presented in a soft luxury frame."}
                </DialogDescription>
                <Button onClick={() => setActiveItem(null)}>Close image</Button>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
