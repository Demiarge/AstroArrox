"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, FileText, FolderTree, KeyRound, LayoutDashboard, Mail, Menu, Package, ScrollText, Settings, ShoppingBag, UserCog, Users, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: FolderTree },
  { href: "/admin/messages", label: "Messages", Icon: Mail },
  { href: "/admin/subscribers", label: "Subscribers", Icon: Users },
  { href: "/admin/content", label: "Content", Icon: FileText },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
  { href: "/admin/admins", label: "Admins", Icon: UserCog },
  { href: "/admin/logs", label: "Activity log", Icon: ScrollText },
  { href: "/admin/password", label: "Change password", Icon: KeyRound },
];

export function AdminShell({ topbar, children }: { topbar: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="flex min-h-dvh bg-subtle print:bg-white">
      {open && <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 print:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link href="/admin" className="font-heading text-lg font-bold">
            Astro<span className="text-brand-text">Arrox</span> <span className="text-xs font-medium text-muted">Admin</span>
          </Link>
          <button type="button" className="grid size-9 place-items-center rounded-lg hover:bg-subtle lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <nav aria-label="Admin" className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map(({ href, label, Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-brand text-white" : "text-foreground/80 hover:bg-subtle hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-between border-t border-line p-3">
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted hover:text-foreground">
            <ExternalLink className="size-4" aria-hidden />
            View store
          </Link>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6 print:hidden">
          <button type="button" className="-ml-1 grid size-10 place-items-center rounded-lg hover:bg-subtle lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" aria-hidden />
          </button>
          <div className="ml-auto flex items-center gap-3">{topbar}</div>
        </header>
        <main id="main" className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
