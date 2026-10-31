import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { getSettings } from "@/lib/data/settings";
import type { ShippingRules } from "@/lib/shipping";
import { requireUser } from "@/lib/user-auth";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const s = await getSettings();
  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mt-4 mb-6 text-3xl font-bold sm:text-4xl">Checkout</h1>
      <Suspense
        fallback={
          <div className="grid gap-8 lg:grid-cols-[1fr_24rem]" aria-busy="true">
            <Skeleton className="h-[32rem] rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        }
      >
        <CustomerCheckout rules={{ insideDhakaFee: s.insideDhakaFee, outsideDhakaFee: s.outsideDhakaFee, freeShippingThreshold: s.freeShippingThreshold }} />
      </Suspense>
    </Container>
  );
}

async function CustomerCheckout({ rules }: { rules: ShippingRules }) {
  const user = await requireUser("/checkout");
  return <CheckoutForm rules={rules} customer={{ name: user.name, email: user.email }} />;
}
