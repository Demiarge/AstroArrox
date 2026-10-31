import type { Metadata } from "next";
import { NewAdminForm } from "@/components/admin/admin-forms";
import { SubmitButton } from "@/components/admin/form-bits";
import { AdminPageHeader, Card, Notice, Pill, Table } from "@/components/admin/ui";
import { deleteAdmin } from "@/lib/actions/admin/admins";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admins" };

const notices: Record<string, { tone: "success" | "warn" | "error"; text: string }> = {
  deleted: { tone: "success", text: "Admin deleted. They were signed out everywhere. Their activity log entries are kept." },
  super: { tone: "error", text: "The super admin can’t be deleted." },
  self: { tone: "warn", text: "You can’t delete your own account. Another admin can." },
  missing: { tone: "warn", text: "That admin was already deleted." },
};

export default async function AdminsPage({ searchParams }: PageProps<"/admin/admins">) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const admins = await db.adminUser.findMany({
    orderBy: [{ isSuperAdmin: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true, isSuperAdmin: true, createdAt: true, createdBy: { select: { name: true, email: true } } },
  });
  const notice = typeof sp.notice === "string" ? notices[sp.notice] : undefined;

  return (
    <>
      <AdminPageHeader title="Admins" description="Everyone here has full access to the admin panel. The super admin can’t be deleted." />
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Card padded={false}>
          <Table>
            <thead>
              <tr>
                <th>Admin</th>
                <th>Role</th>
                <th>Added</th>
                <th>Added by</th>
                <th className="text-right!">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className="flex items-center gap-2 font-medium">
                      {a.name}
                      {a.id === me.id && <Pill>You</Pill>}
                    </span>
                    <span className="block text-xs text-muted">{a.email}</span>
                  </td>
                  <td>{a.isSuperAdmin ? <Pill tone="brand">Super admin</Pill> : <span className="text-muted">Admin</span>}</td>
                  <td className="whitespace-nowrap text-muted">{formatDate(a.createdAt)}</td>
                  <td className="text-muted">
                    {a.createdBy ? (
                      <span title={a.createdBy.email}>{a.createdBy.name}</span>
                    ) : a.isSuperAdmin ? (
                      "Setup (.env)"
                    ) : (
                      // Created via `npm run admin:create`, or their creator was deleted.
                      "—"
                    )}
                  </td>
                  <td className="text-right">
                    {!a.isSuperAdmin && a.id !== me.id && (
                      <form action={deleteAdmin} className="inline">
                        <input type="hidden" name="id" value={a.id} />
                        <SubmitButton variant="ghost" size="sm" className="h-8 text-sale" confirm={`Delete ${a.name} (${a.email})? They’ll be signed out immediately.`}>
                          Delete
                        </SubmitButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card title="Add an admin">
          <NewAdminForm />
        </Card>
      </div>
    </>
  );
}
