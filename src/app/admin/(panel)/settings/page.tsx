import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data/settings";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  // Bypass the storefront cache so the form is always current.
  const row = await db.setting.findUnique({ where: { id: 1 }, omit: { id: true, updatedAt: true } });
  const settings = row ?? (await getSettings());
  return (
    <>
      <AdminPageHeader title="Settings" description="Store-wide details used across the storefront." />
      <SettingsForm settings={settings} />
    </>
  );
}
