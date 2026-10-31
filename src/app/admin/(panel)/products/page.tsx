import type { Metadata } from "next";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { AdminPageHeader, Card, EmptyRow, Notice, Pill, Table } from "@/components/admin/ui";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { ButtonLink } from "@/components/ui/button";
import { inputClass } from "@/components/ui/form-field";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTaka } from "@/lib/format";

export const metadata: Metadata = { title: "Products" };

const notices: Record<string, { tone: "success" | "warn"; text: string }> = {
  deleted: { tone: "success", text: "Product deleted." },
  hidden: { tone: "warn", text: "This product appears in past orders, so it was deactivated (hidden from the store) instead of deleted." },
};

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const active = sp.active === "1" ? true : sp.active === "0" ? false : null;

  const where: Prisma.ProductWhereInput = {
    ...(q && { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] }),
    ...(category && { categoryId: category }),
    ...(active !== null && { isActive: active }),
  };

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        compareAtPrice: true,
        stock: true,
        isActive: true,
        isFeatured: true,
        isNew: true,
        category: { select: { name: true } },
        images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  const notice = typeof sp.notice === "string" ? notices[sp.notice] : undefined;

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={`${products.length} shown`}
        actions={
          <ButtonLink href="/admin/products/new">
            <Plus className="size-4" aria-hidden />
            New product
          </ButtonLink>
        }
      />
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      <Form action="/admin/products" className="mb-4 flex flex-wrap gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <input id="product-search" name="q" defaultValue={q} placeholder="Name or SKU…" className={`${inputClass} h-10 pl-9 text-sm`} />
        </div>
        <label htmlFor="filter-category" className="sr-only">
          Category
        </label>
        <select id="filter-category" name="category" defaultValue={category} className={`${inputClass} h-10 w-auto text-sm`}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label htmlFor="filter-active" className="sr-only">
          Status
        </label>
        <select id="filter-active" name="active" defaultValue={active === null ? "" : active ? "1" : "0"} className={`${inputClass} h-10 w-auto text-sm`}>
          <option value="">Active & inactive</option>
          <option value="1">Active only</option>
          <option value="0">Inactive only</option>
        </select>
        <button type="submit" className="h-10 rounded-xl border border-line bg-surface px-4 text-sm font-medium hover:bg-subtle">
          Filter
        </button>
        {(q || category || active !== null) && (
          <Link href="/admin/products" className="inline-flex h-10 items-center px-2 text-sm text-muted hover:text-foreground">
            Clear
          </Link>
        )}
      </Form>

      <Card padded={false}>
        <Table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && <EmptyRow colSpan={5}>No products found.</EmptyRow>}
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/products/${p.id}`} className="group flex items-center gap-3">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                      {p.images[0] ? <Image src={p.images[0].url} alt="" fill sizes="44px" className="object-contain p-0.5" /> : <ProductPlaceholder compact />}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-1 font-medium group-hover:text-brand-text">{p.name}</span>
                      <span className="block text-xs text-muted">{p.sku}</span>
                    </span>
                  </Link>
                </td>
                <td>{p.category.name}</td>
                <td className="tabular-nums">
                  {formatTaka(p.price)}
                  {p.compareAtPrice && <s className="ml-1.5 text-xs text-muted">{formatTaka(p.compareAtPrice)}</s>}
                </td>
                <td>
                  <Pill tone={p.stock === 0 ? "danger" : p.stock <= 5 ? "warn" : "neutral"}>{p.stock}</Pill>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <Pill tone={p.isActive ? "success" : "neutral"}>{p.isActive ? "Active" : "Hidden"}</Pill>
                    {p.isFeatured && <Pill tone="brand">Featured</Pill>}
                    {p.isNew && <Pill tone="brand">New</Pill>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
