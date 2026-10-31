import type { Metadata } from "next";
import { PasswordForm } from "@/components/admin/password-form";
import { AdminPageHeader, Card } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Change password" };

export default async function PasswordPage() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminPageHeader title="Change password" description={`Signed in as ${admin.email}`} />
      <Card className="max-w-md">
        <PasswordForm />
      </Card>
    </>
  );
}
