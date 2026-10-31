// The rest of the app only sees public URLs, so moving to S3/R2 means rewriting just this file.
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

// Not public/: `next start` only serves files that existed there at build time.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const PUBLIC_PREFIX = "/uploads/";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export function randomKey(folder: string, ext: string): string {
  return `${folder}/${randomBytes(16).toString("hex")}.${ext.replace(/^\./, "")}`;
}

function toDiskPath(key: string): string {
  const full = path.resolve(UPLOAD_DIR, key);
  if (!full.startsWith(UPLOAD_DIR + path.sep)) throw new Error(`Invalid storage key: ${key}`);
  return full;
}

export function publicUrl(key: string): string {
  return PUBLIC_PREFIX + key;
}

/** Returns the public URL. */
export async function putFile(key: string, data: Uint8Array): Promise<string> {
  const file = toDiskPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
  return publicUrl(key);
}

export async function fileExists(key: string): Promise<boolean> {
  try {
    return (await stat(toDiskPath(key))).isFile();
  } catch {
    return false;
  }
}

export async function readStoredFile(key: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  const contentType = CONTENT_TYPES[path.extname(key).toLowerCase()];
  if (!contentType) return null;
  try {
    return { data: new Uint8Array(await readFile(toDiskPath(key))), contentType };
  } catch {
    return null;
  }
}

/** Ignores URLs this storage doesn't own. */
export async function deleteFile(url: string): Promise<void> {
  if (!url.startsWith(PUBLIC_PREFIX)) return;
  await rm(toDiskPath(url.slice(PUBLIC_PREFIX.length)), { force: true });
}
