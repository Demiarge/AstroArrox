import { readStoredFile } from "@/lib/storage";

const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export async function GET(_request: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path } = await ctx.params;
  if (!path.length || !path.every((s) => SAFE_SEGMENT.test(s))) return new Response("Not found", { status: 404 });

  const file = await readStoredFile(path.join("/"));
  if (!file) return new Response("Not found", { status: 404 });

  // Random-named uploads never change, so they can be cached for a year.
  const immutable = /[0-9a-f]{32}\.\w+$/.test(path.at(-1)!);
  return new Response(Buffer.from(file.data), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
