"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { FormAlert } from "@/components/ui/form-field";
import { deleteProductImage, reorderProductImages, uploadProductImage } from "@/lib/actions/admin/products";
import { cn } from "@/lib/cn";

type Img = { id: string; url: string; alt: string };

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageManager({ productId, images }: { productId: string; images: Img[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function upload(files: FileList) {
    const problems: string[] = [];
    const list = [...files];
    for (const [i, file] of list.entries()) {
      // Early feedback only; the server checks the real file type.
      if (!TYPES.includes(file.type)) {
        problems.push(`“${file.name}” isn’t a JPG, PNG or WebP image.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        problems.push(`“${file.name}” is larger than 5 MB.`);
        continue;
      }
      setProgress(`Uploading ${i + 1} of ${list.length}…`);
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadProductImage(productId, fd);
      if (!res.ok && res.error) problems.push(res.error);
    }
    setProgress(null);
    setErrors(problems);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  const reorder = (ids: string[]) => startTransition(() => reorderProductImages(productId, ids));
  const move = (from: number, to: number) => {
    const ids = images.map((i) => i.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    reorder(ids);
  };

  return (
    <div className="space-y-4">
      {errors.map((e) => (
        <FormAlert key={e}>{e}</FormAlert>
      ))}
      {images.length > 0 ? (
        <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", pending && "pointer-events-none opacity-60")}>
          {images.map((img, i) => (
            <li key={img.id} className="overflow-hidden rounded-xl border border-line bg-surface">
              <div className="relative aspect-square bg-white">
                <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-contain p-2" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">
                    <Star className="size-3" aria-hidden /> Main
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 border-t border-line p-1.5">
                <div className="flex">
                  <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)} className="grid size-8 place-items-center rounded-lg hover:bg-subtle disabled:opacity-30" aria-label="Move left">
                    <ArrowLeft className="size-4" aria-hidden />
                  </button>
                  <button type="button" disabled={i === images.length - 1} onClick={() => move(i, i + 1)} className="grid size-8 place-items-center rounded-lg hover:bg-subtle disabled:opacity-30" aria-label="Move right">
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                  {i !== 0 && (
                    <button type="button" onClick={() => move(i, 0)} className="grid size-8 place-items-center rounded-lg hover:bg-subtle" aria-label="Make main image" title="Make main image">
                      <Star className="size-4" aria-hidden />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this image?")) startTransition(() => deleteProductImage(img.id));
                  }}
                  className="grid size-8 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-sale"
                  aria-label="Delete image"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No images yet. The store shows a placeholder until you add one.</p>
      )}

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line p-6 text-center transition-colors hover:border-brand-text/50 hover:bg-subtle",
          progress && "pointer-events-none opacity-70",
        )}
      >
        {progress ? <Loader2 className="size-6 animate-spin text-brand-text" aria-hidden /> : <ImagePlus className="size-6 text-brand-text" aria-hidden />}
        <span className="text-sm font-medium">{progress ?? "Upload images"}</span>
        <span className="text-xs text-muted">JPG, PNG or WebP · up to 5 MB each · up to 20 per product · select several at once</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files?.length && upload(e.target.files)}
        />
      </label>
    </div>
  );
}
