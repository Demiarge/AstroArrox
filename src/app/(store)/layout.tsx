import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartHydrator } from "@/components/cart/cart-hydrator";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PromoBar } from "@/components/layout/promo-bar";
import { getSettings } from "@/lib/data/settings";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const rules = {
    insideDhakaFee: s.insideDhakaFee,
    outsideDhakaFee: s.outsideDhakaFee,
    freeShippingThreshold: s.freeShippingThreshold,
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <PromoBar />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartHydrator />
      <CartDrawer rules={rules} />
    </>
  );
}
