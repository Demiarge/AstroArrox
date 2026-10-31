import { LogOut } from "lucide-react";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { logout } from "@/lib/actions/admin/auth";
import { requireAdmin } from "@/lib/auth";

async function AdminIdentity() {
  const admin = await requireAdmin();
  return (
    <>
      <span className="hidden max-w-80 truncate text-sm text-muted sm:inline" title={admin.email}>
        <span className="font-medium text-foreground">{admin.name}</span> · {admin.email}
      </span>
      <form action={logout}>
        <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium hover:bg-subtle">
          <LogOut className="size-4" aria-hidden />
          Log out
        </button>
      </form>
    </>
  );
}

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminShell
      topbar={
        <Suspense fallback={<Skeleton className="h-9 w-48" />}>
          <AdminIdentity />
        </Suspense>
      }
    >
      {/* No Suspense here: it wouldn't cover client navigations (see loading.tsx). */}
      {children}
    </AdminShell>
  );
}
