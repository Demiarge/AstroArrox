import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/cart-page-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default async function CartPage() {
  const s = await getSettings();
  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 className="mt-4 mb-6 text-3xl font-bold sm:text-4xl">Your cart</h1>
      <CartPageView
        rules={{ insideDhakaFee: s.insideDhakaFee, outsideDhakaFee: s.outsideDhakaFee, freeShippingThreshold: s.freeShippingThreshold }}
      />
    </Container>
  );
}
