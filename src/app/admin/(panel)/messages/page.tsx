import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Mail, Reply } from "lucide-react";
import { SubmitButton } from "@/components/admin/form-bits";
import { AdminPageHeader, Card, Pill } from "@/components/admin/ui";
import { Pagination } from "@/components/ui/pagination";
import { deleteMessage, setMessageRead } from "@/lib/actions/admin/inbox";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/dates";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Messages" };

const PER_PAGE = 50;

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  await requireAdmin();
  const sp = await searchParams;
  const unreadOnly = sp.filter === "unread";
  const page = Math.min(Math.max(1, Math.floor(Number(sp.page)) || 1), 10_000);
  const where = unreadOnly ? { isRead: false } : undefined;
  const [messages, total, unread] = await Promise.all([
    db.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.contactMessage.count({ where }),
    db.contactMessage.count({ where: { isRead: false } }),
  ]);
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (unreadOnly) params.set("filter", "unread");
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/admin/messages?${s}` : "/admin/messages";
  };

  return (
    <>
      <AdminPageHeader title="Messages" description={`${unread} unread`} />
      <nav className="mb-4 flex gap-1" aria-label="Filter messages">
        {[
          { href: "/admin/messages", label: "All", active: !unreadOnly },
          { href: "/admin/messages?filter=unread", label: `Unread (${unread})`, active: unreadOnly },
        ].map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.active ? "page" : undefined}
            className={cn("inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium", t.active ? "bg-brand text-white" : "bg-surface ring-1 ring-line hover:bg-subtle")}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {messages.length === 0 ? (
        <Card>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Mail className="size-4" aria-hidden />
            {unreadOnly ? "No unread messages." : "No messages yet. Messages from the contact form appear here."}
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id}>
              <details className={cn("group rounded-2xl border bg-surface shadow-card", m.isRead ? "border-line" : "border-brand/40")}>
                <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", m.isRead ? "bg-transparent" : "bg-brand")} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className={cn("truncate", !m.isRead && "font-semibold")}>{m.subject}</span>
                      {!m.isRead && <Pill tone="brand">New</Pill>}
                    </div>
                    <p className="truncate text-sm text-muted">
                      {m.name} · {m.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{formatDateTime(m.createdAt)}</span>
                  <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="border-t border-line p-4">
                  <p className="text-[15px] whitespace-pre-wrap">{m.message}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-hover"
                    >
                      <Reply className="size-4" aria-hidden />
                      Reply by email
                    </a>
                    <form action={setMessageRead}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="isRead" value={String(!m.isRead)} />
                      <SubmitButton variant="secondary" size="sm" className="h-9">
                        Mark as {m.isRead ? "unread" : "read"}
                      </SubmitButton>
                    </form>
                    <form action={deleteMessage}>
                      <input type="hidden" name="id" value={m.id} />
                      <SubmitButton variant="ghost" size="sm" className="h-9 text-sale" confirm="Delete this message?">
                        Delete
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pageCount={Math.max(1, Math.ceil(total / PER_PAGE))} href={pageHref} />
    </>
  );
}
