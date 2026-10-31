import type { Metadata } from "next";
import { Download } from "lucide-react";
import { SubmitButton } from "@/components/admin/form-bits";
import { AdminPageHeader, Card, EmptyRow, Table } from "@/components/admin/ui";
import { deleteSubscriber } from "@/lib/actions/admin/inbox";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  await requireAdmin();
  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <AdminPageHeader
        title="Subscribers"
        description={`${subscribers.length} newsletter ${subscribers.length === 1 ? "subscriber" : "subscribers"}`}
        actions={
          // Plain <a>: the route returns a CSV file, not a page.
          <a href="/admin/subscribers/export" download className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover">
            <Download className="size-4" aria-hidden />
            Export CSV
          </a>
        }
      />
      <Card padded={false}>
        <Table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed</th>
              <th className="text-right!">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 && <EmptyRow colSpan={3}>No subscribers yet. Signups from the footer form appear here.</EmptyRow>}
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{s.email}</td>
                <td className="text-muted">{formatDateTime(s.createdAt)}</td>
                <td className="text-right">
                  <form action={deleteSubscriber} className="inline">
                    <input type="hidden" name="id" value={s.id} />
                    <SubmitButton variant="ghost" size="sm" className="h-8 text-sale" confirm={`Remove ${s.email}?`}>
                      Remove
                    </SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
