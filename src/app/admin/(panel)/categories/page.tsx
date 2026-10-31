import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";
import { SubmitButton } from "@/components/admin/form-bits";
import { AdminPageHeader, Card, EmptyRow, Notice, Pill, Table } from "@/components/admin/ui";
import { isPrintingCategory, PRINTING_PATH } from "@/lib/3d-printing";
import { deleteCategory } from "@/lib/actions/admin/categories";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Categories" };

const notices: Record<string, { tone: "success" | "warn"; text: string }> = {
  created: { tone: "success", text: "Category added." },
  saved: { tone: "success", text: "Category saved." },
  deleted: { tone: "success", text: "Category deleted." },
  "has-products": { tone: "warn", text: "That category still has products. Move or delete them first." },
  protected: { tone: "warn", text: "The 3D Printing category can’t be deleted, because the 3D Printing page lists its products." },
};

export default async function CategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  await requireAdmin();
  const sp = await searchParams;
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } }, products: { where: { isActive: true }, select: { id: true } } },
  });
  const notice = typeof sp.notice === "string" ? notices[sp.notice] : undefined;
  const nextSort = (categories.at(-1)?.sortOrder ?? -1) + 1;

  return (
    <>
      <AdminPageHeader title="Categories" description="Categories without active products are hidden from the store automatically." />
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Card padded={false}>
          <Table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th>Order</th>
                <th>Status</th>
                <th className="text-right!">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && <EmptyRow colSpan={5}>No categories yet.</EmptyRow>}
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/categories/${c.id}`} className="group flex items-center gap-3">
                      <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-white">
                        {c.imageUrl ? <Image src={c.imageUrl} alt="" fill sizes="40px" className="object-cover" /> : <Package className="size-4 text-muted" aria-hidden />}
                      </span>
                      <span>
                        <span className="block font-medium group-hover:text-brand-text">{c.name}</span>
                        <span className="block font-mono text-xs text-muted">{c.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="tabular-nums">
                    {c.products.length} active{c._count.products !== c.products.length && <span className="text-muted"> / {c._count.products}</span>}
                  </td>
                  <td className="tabular-nums">{c.sortOrder}</td>
                  <td>
                    {!c.isActive ? (
                      <Pill>Inactive</Pill>
                    ) : isPrintingCategory(c.slug) ? (
                      <Pill tone="brand">On {PRINTING_PATH}</Pill>
                    ) : c.products.length === 0 ? (
                      <Pill tone="warn">Hidden (empty)</Pill>
                    ) : (
                      <Pill tone="success">Visible</Pill>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/categories/${c.id}`} className="inline-flex h-8 items-center rounded-lg border border-line px-3 text-xs font-medium hover:bg-subtle">
                        Edit
                      </Link>
                      {c._count.products === 0 && !isPrintingCategory(c.slug) && (
                        <form action={deleteCategory}>
                          <input type="hidden" name="id" value={c.id} />
                          <SubmitButton variant="ghost" size="sm" className="h-8 text-sale" confirm={`Delete the “${c.name}” category?`}>
                            Delete
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card title="Add a category">
          <CategoryForm initial={{ name: "", slug: "", sortOrder: nextSort, isActive: true, imageUrl: null }} />
        </Card>
      </div>
    </>
  );
}
