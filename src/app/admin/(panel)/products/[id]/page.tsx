import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { SubmitButton } from "@/components/admin/form-bits";
import { ImageManager } from "@/components/admin/image-manager";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader, Card, Notice } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { deleteProduct } from "@/lib/actions/admin/products";
import { requireAdmin } from "@/lib/auth";
import { parseSpecs } from "@/lib/data/catalog";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } }, _count: { select: { orderItems: true } } },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();
  const hasOrders = product._count.orderItems > 0;

  return (
    <>
      <AdminPageHeader
        back={{ label: "Products", href: "/admin/products" }}
        title={product.name}
        description={`SKU ${product.sku}`}
        actions={
          product.isActive && (
            <ButtonLink href={`/product/${product.slug}`} external variant="secondary" size="sm">
              <ExternalLink className="size-4" aria-hidden />
              View in store
            </ButtonLink>
          )
        }
      />
      {sp.created === "1" && <Notice>Product created. Now add some images below.</Notice>}

      <div className="space-y-6">
        <Card title={`Images (${product.images.length})`}>
          <ImageManager productId={product.id} images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))} />
        </Card>

        <ProductForm
          categories={categories}
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            categoryId: product.categoryId,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            stock: product.stock,
            description: product.description,
            specs: parseSpecs(product.specs),
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            isNew: product.isNew,
          }}
        />

        <Card title="Danger zone">
          <form action={deleteProduct} className="flex flex-wrap items-center justify-between gap-4">
            <input type="hidden" name="id" value={product.id} />
            <p className="max-w-xl text-sm text-muted">
              {hasOrders
                ? "This product appears in past orders, so it can’t be removed. Deleting will deactivate it (hide it from the store) instead."
                : "Permanently delete this product and its images."}
            </p>
            <SubmitButton variant="danger" confirm={hasOrders ? "Hide this product from the store?" : "Delete this product permanently?"}>
              {hasOrders ? "Deactivate product" : "Delete product"}
            </SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
