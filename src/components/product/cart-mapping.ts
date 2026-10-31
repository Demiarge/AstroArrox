import type { CartProduct } from "@/lib/cart/store";
import type { ProductDetail } from "@/lib/data/catalog";

export function toCartProductFromDetail(p: ProductDetail): CartProduct {
  return {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    imageUrl: p.images[0]?.url ?? null,
    stock: p.stock,
  };
}
