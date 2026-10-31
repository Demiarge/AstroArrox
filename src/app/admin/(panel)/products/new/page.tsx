import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <AdminPageHeader back={{ label: "Products", href: "/admin/products" }} title="New product" />
      <ProductForm
        categories={categories}
        initial={{
          name: "",
          slug: "",
          sku: "",
          categoryId: "",
          price: "",
          compareAtPrice: null,
          stock: "",
          description: "",
          specs: [],
          isActive: true,
          isFeatured: false,
          isNew: true,
        }}
      />
    </>
  );
}
