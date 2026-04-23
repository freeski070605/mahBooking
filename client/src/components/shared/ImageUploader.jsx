import { useState } from "react";
import { ImagePlus, LoaderCircle, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { uploadsApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

export function ImageUploader({
  value,
  publicId,
  uploadType,
  onChange,
  helper = "JPG, PNG, or WEBP up to 5MB.",
}) {
  const [preview, setPreview] = useState(value || "");
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const data = await uploadsApi.image(file, uploadType);
      onChange({
        imageUrl: data.imageUrl,
        imagePublicId: data.imagePublicId,
      });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(getErrorMessage(error, "Image upload failed."));
      setPreview(value || "");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="relative aspect-[4/5] w-full bg-surface-100">
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-700/45">
              <ImagePlus className="h-10 w-10" />
            </div>
          )}
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-900/35 text-white">
              <LoaderCircle className="h-6 w-6 animate-spin" />
            </div>
          ) : null}
        </div>
      </Card>
      <div className="flex flex-wrap gap-3">
        <label className="inline-flex cursor-pointer">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button type="button" asChild>
            <span>{value ? "Replace image" : "Upload image"}</span>
          </Button>
        </label>
        {value ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setPreview("");
              onChange({ imageUrl: "", imagePublicId: publicId || "" });
            }}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        ) : null}
        {preview && value && preview !== value ? (
          <Button type="button" variant="ghost" onClick={() => setPreview(value)}>
            <RefreshCcw className="h-4 w-4" />
            Reset preview
          </Button>
        ) : null}
      </div>
      <p className="text-sm text-ink-700/65">{helper}</p>
    </div>
  );
}
