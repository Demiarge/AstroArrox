import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminPageHeader, Card } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const c = await db.category.findUnique({ where: { id } });
  if (!c) notFound();
  return (
    <>
      <AdminPageHeader back={{ label: "Categories", href: "/admin/categories" }} title={c.name} />
      <Card className="max-w-2xl">
        <CategoryForm initial={{ id: c.id, name: c.name, slug: c.slug, sortOrder: c.sortOrder, isActive: c.isActive, imageUrl: c.imageUrl }} />
      </Card>
    </>
  );
}
