import { putFile, randomKey } from "@/lib/storage";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Magic bytes only: the filename and browser MIME type can't be trusted.
function sniffImage(b: Uint8Array): "jpg" | "png" | "webp" | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length > 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)) return "png";
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (b.length > 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

// Browsers send an empty File when nothing is picked.
export const isFile = (v: FormDataEntryValue | null): v is File => v instanceof File && v.size > 0;

export async function saveImageUpload(file: File, folder: string): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: `“${file.name}” is larger than 5 MB.` };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffImage(bytes);
  if (!ext) return { ok: false, error: `“${file.name}” isn’t a JPG, PNG or WebP image.` };
  return { ok: true, url: await putFile(randomKey(folder, ext), bytes) };
}
