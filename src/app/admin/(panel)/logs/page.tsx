import type { Metadata } from "next";
import Link from "next/link";
import { LogFilter } from "@/components/admin/log-filter";
import { AdminPageHeader, Card, EmptyRow, Pill, Table } from "@/components/admin/ui";
import { Pagination } from "@/components/ui/pagination";
import type { Prisma } from "@/generated/prisma/client";
import { ADMIN_ACTIONS, type AdminAction, type AdminLogTarget } from "@/lib/admin-log";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { db } from "@/lib/db";
import { STATUS_LABELS } from "@/lib/orders";

export const metadata: Metadata = { title: "Activity log" };

const PER_PAGE = 50;

const TARGET_LABELS: Record<AdminLogTarget, string> = {
  admin: "Admin",
  order: "Order",
  product: "Product",
  category: "Category",
  page: "Page",
  faq: "FAQ",
  message: "Message",
  subscriber: "Subscriber",
  settings: "Settings",
};

const FIELD_LABELS: Record<string, string> = {
  adminNote: "Internal note",
  categoryId: "Category",
  compareAtPrice: "Compare-at price",
  imageUrl: "Image",
  heroImageUrl: "Hero image",
  logoLightUrl: "Logo (light)",
  logoDarkUrl: "Logo (dark)",
  logoSquareUrl: "Square logo",
  isActive: "Active",
  isFeatured: "Featured",
  isNew: "New",
  stockRestored: "Stock put back",
  url: "Image",
  whatsappNumber: "WhatsApp number",
};

/** "freeShippingThreshold" → "Free shipping threshold" */
function fieldLabel(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const words = key.replace(/([A-Z])/g, " $1").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "(empty)";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (key === "status" && typeof value === "string" && value in STATUS_LABELS) return STATUS_LABELS[value as keyof typeof STATUS_LABELS];
  if (key === "paymentStatus") return value === "PAID" ? "Paid" : "Unpaid";
  return typeof value === "string" || typeof value === "number" ? String(value) : JSON.stringify(value);
}

/** e.g. "Price: 6500 → 6000", "Note: Sent with Pathao" */
function LogDetails({ details }: { details: Prisma.JsonValue }) {
  if (!details || typeof details !== "object" || Array.isArray(details)) return null;
  const { changes, ...extra } = details as Prisma.JsonObject;
  const lines: { key: string; text: string }[] = [];
  if (changes && typeof changes === "object" && !Array.isArray(changes)) {
    for (const [key, change] of Object.entries(changes)) {
      const c = (change ?? {}) as { from?: unknown; to?: unknown };
      lines.push({ key: `c-${key}`, text: `${fieldLabel(key)}: ${formatValue(key, c.from)} → ${formatValue(key, c.to)}` });
    }
  }
  for (const [key, value] of Object.entries(extra)) lines.push({ key, text: `${fieldLabel(key)}: ${formatValue(key, value)}` });
  if (lines.length === 0) return null;
  return (
    <ul className="mt-1 space-y-0.5 text-xs break-words text-muted">
      {lines.map((l) => (
        <li key={l.key}>{l.text}</li>
      ))}
    </ul>
  );
}

type LogRow = { targetType: string; targetId: string | null };

/** Only links targets that still exist. */
async function targetLinker(logs: LogRow[]) {
  const idsOf = (type: AdminLogTarget) => [...new Set(logs.filter((l) => l.targetType === type && l.targetId).map((l) => l.targetId!))];
  const [orders, products, categories] = await Promise.all([
    db.order.findMany({ where: { id: { in: idsOf("order") } }, select: { id: true } }),
    db.product.findMany({ where: { id: { in: idsOf("product") } }, select: { id: true } }),
    db.category.findMany({ where: { id: { in: idsOf("category") } }, select: { id: true } }),
  ]);
  const live = new Set([...orders, ...products, ...categories].map((r) => r.id)); // cuids never repeat across tables
  return ({ targetType, targetId }: LogRow): string | null => {
    if (!targetId) return null;
    if (targetType === "page") return `/admin/content/${targetId}`;
    if (targetType === "settings") return "/admin/settings";
    if (!live.has(targetId)) return null;
    return { order: `/admin/orders/${targetId}`, product: `/admin/products/${targetId}`, category: `/admin/categories/${targetId}` }[targetType] ?? null;
  };
}

export default async function LogsPage({ searchParams }: PageProps<"/admin/logs">) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.min(Math.max(1, Math.floor(Number(sp.page)) || 1), 10_000);
  const adminId = typeof sp.admin === "string" ? sp.admin.trim().slice(0, 40) : "";
  const where = adminId ? { adminId } : undefined;

  const [logs, total, loggedAdmins, admins] = await Promise.all([
    db.adminLog.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.adminLog.count({ where }),
    // Includes deleted admins.
    db.adminLog.groupBy({ by: ["adminId", "adminEmail"] }),
    db.adminUser.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);
  const current = new Map(admins.map((a) => [a.id, a]));
  const deleted = new Map(loggedAdmins.filter((l) => !current.has(l.adminId)).map((l) => [l.adminId, l.adminEmail]));
  const options = [
    ...admins.map((a) => ({ value: a.id, label: `${a.name} (${a.email})` })),
    ...[...deleted].map(([id, email]) => ({ value: id, label: `${email} (deleted admin)` })),
  ];
  const selected = options.find((o) => o.value === adminId);
  const linkFor = await targetLinker(logs);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (adminId) params.set("admin", adminId);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/admin/logs?${s}` : "/admin/logs";
  };

  return (
    <>
      <AdminPageHeader
        title="Activity log"
        description={`${total} ${total === 1 ? "entry" : "entries"}${selected ? ` by ${selected.label}` : ""}, newest first. Entries are permanent: they can’t be edited or deleted.`}
      />
      <div className="mb-4">
        <LogFilter value={selected ? adminId : ""} options={options} />
      </div>

      <Card padded={false}>
        <Table>
          <thead>
            <tr>
              <th>When</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && <EmptyRow colSpan={4}>No activity yet. Changes made in the admin panel appear here.</EmptyRow>}
            {logs.map((log) => {
              const who = current.get(log.adminId);
              const href = linkFor(log);
              return (
                <tr key={log.id} className="align-top">
                  <td className="whitespace-nowrap text-muted">{formatDateTime(log.createdAt)}</td>
                  <td>
                    <span className="block font-medium">{who ? who.name : log.adminEmail}</span>
                    {who ? <span className="block text-xs text-muted">{log.adminEmail}</span> : <Pill>Deleted admin</Pill>}
                  </td>
                  <td className="max-w-md">
                    <span className="font-medium" title={log.action}>
                      {ADMIN_ACTIONS[log.action as AdminAction] ?? log.action}
                    </span>
                    {log.details !== null && <LogDetails details={log.details} />}
                  </td>
                  <td className="max-w-xs">
                    <span className="block text-xs text-muted">{TARGET_LABELS[log.targetType as AdminLogTarget] ?? log.targetType}</span>
                    {href ? (
                      <Link href={href} className="font-medium break-words text-brand-text hover:underline">
                        {log.targetLabel ?? log.targetId}
                      </Link>
                    ) : (
                      <span className="break-words">{log.targetLabel ?? log.targetId ?? "—"}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
      <Pagination page={page} pageCount={Math.max(1, Math.ceil(total / PER_PAGE))} href={pageHref} />
    </>
  );
}
