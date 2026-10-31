"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartProduct } from "@/lib/cart/store";
import type { ProductCardData } from "@/lib/data/catalog";

export function toCartProduct(p: Pick<ProductCardData, "id" | "slug" | "name" | "price" | "compareAtPrice" | "stock"> & { image: { url: string } | null }): CartProduct {
  return {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    imageUrl: p.image?.url ?? null,
    stock: p.stock,
  };
}

type Props = {
  product: ProductCardData;
  className?: string;
};

export function AddToCartButton({ product, className }: Props) {
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const soldOut = product.stock <= 0;

  return (
    <Button
      variant={soldOut ? "secondary" : "primary"}
      size="sm"
      className={className}
      disabled={soldOut}
      aria-label={soldOut ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
      onClick={() => {
        add(toCartProduct(product));
        openDrawer();
      }}
    >
      {!soldOut && <ShoppingCart className="size-4" aria-hidden />}
      {soldOut ? "Out of stock" : "Add to cart"}
    </Button>
  );
}
