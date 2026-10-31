import { NextResponse, type NextRequest } from "next/server";
import { PRINTING_CATEGORY_SLUG, PRINTING_PATH } from "@/lib/3d-printing";
import { ADMIN_COOKIE, USER_COOKIE } from "@/lib/auth-constants";

const CUSTOMER_PATHS = ["/account", "/checkout"];

// next.config.ts allows 12 MB for admin uploads; everyone else is held to 1 MB here.
const MAX_PUBLIC_BODY = 1024 * 1024;

const isUnder = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

async function bodyTooLarge(request: NextRequest): Promise<boolean> {
  const length = request.headers.get("content-length");
  if (length !== null) return Number(length) > MAX_PUBLIC_BODY;
  // No content-length (streamed body): measure it.
  return (await request.arrayBuffer()).byteLength > MAX_PUBLIC_BODY;
}

/** Cookie checks here are convenience redirects only; pages and actions verify the session. */
export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const isAdminPath = isUnder(pathname, "/admin");
  const isRead = request.method === "GET" || request.method === "HEAD";

  const adminSession = isAdminPath && pathname !== "/admin/login" && request.cookies.has(ADMIN_COOKIE);
  if (!adminSession && !isRead && (await bodyTooLarge(request))) {
    return new NextResponse("Request too large", { status: 413 });
  }

  if (isRead && pathname === "/shop" && searchParams.get("category")?.trim() === PRINTING_CATEGORY_SLUG) {
    return NextResponse.redirect(new URL(PRINTING_PATH, request.url));
  }

  if (isAdminPath) {
    if (pathname === "/admin/login" || adminSession) return NextResponse.next();
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  if (CUSTOMER_PATHS.some((p) => isUnder(pathname, p)) && !request.cookies.has(USER_COOKIE)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  // Static files and stored images skip the proxy.
  matcher: ["/((?!_next/static|_next/image|uploads/).*)"],
};
