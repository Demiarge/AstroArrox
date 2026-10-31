import Image from "next/image";
import { ArrowRight, Check, HandCoins, Headset, RotateCcw, Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { CategoryTiles } from "@/components/home/category-tiles";
import { ProductGrid } from "@/components/product/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getActiveProductCount, getHomeProducts, getNavCategories } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { formatTaka, whatsappLink } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";

export default async function HomePage() {
  const [settings, categories, products, productCount] = await Promise.all([
    getSettings(),
    getNavCategories(),
    getHomeProducts(12),
    getActiveProductCount(),
  ]);
  const talkToUs = whatsappLink(settings.whatsappNumber, `Hi ${settings.storeName}, I have a question.`);
  const freeShipping = formatTaka(settings.freeShippingThreshold);

  const features = [
    { Icon: Truck, title: "Fast Delivery", text: `Delivered in ${settings.deliveryTimeText} anywhere in Bangladesh.` },
    { Icon: HandCoins, title: "Cash on Delivery", text: "Pay when it arrives. No card or advance payment needed." },
    { Icon: RotateCcw, title: "Easy Returns", text: "Changed your mind? Return unused items within 30 days." },
    { Icon: Headset, title: "Expert Support", text: "Real engineers and hobbyists help you choose and build." },
  ];

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: settings.storeName,
    url: absoluteUrl("/"),
    logo: settings.logoSquareUrl ? absoluteUrl(settings.logoSquareUrl) : undefined,
    email: settings.email || undefined,
    telephone: settings.whatsappNumber,
    address: settings.address || undefined,
    sameAs: [settings.facebookUrl, settings.youtubeUrl].filter(Boolean),
    currenciesAccepted: "BDT",
    paymentAccepted: "Cash",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_15%_0%,var(--brand-soft),transparent_70%),radial-gradient(50%_60%_at_100%_100%,var(--brand-soft),transparent_70%)]"
        />
        <Container className="relative py-10 sm:py-14 lg:py-16">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-muted">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              Cash on delivery · Free shipping over {freeShipping}
            </p>
            <h1 className="text-4xl leading-[1.05] font-bold text-balance sm:text-5xl lg:text-6xl">{settings.heroHeadline}</h1>
            <p className="mt-4 max-w-xl text-lg text-pretty text-muted">{settings.heroSubtext}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/shop" size="lg">
                Shop now
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href={talkToUs} external size="lg" variant="secondary">
                <WhatsAppIcon className="size-5 text-whatsapp dark:text-success" />
                Talk to us
              </ButtonLink>
            </div>
          </div>
          {settings.heroImageUrl && (
            <div className="relative mt-10 overflow-hidden rounded-2xl border border-line bg-white shadow-card-hover">
              <Image
                src={settings.heroImageUrl}
                alt={`${settings.storeName}: drones, robotics, embedded systems and R&D`}
                width={1600}
                height={313}
                sizes="(min-width: 1280px) 1216px, 100vw"
                preload
                className="h-auto w-full"
              />
            </div>
          )}
        </Container>
      </section>

      {categories.length > 0 && (
        <section className="py-14 sm:py-16">
          <Container>
            <SectionHeading
              title="Shop by Category"
              subtitle="Parts and kits for every kind of build."
              action={{ label: "All products", href: "/shop" }}
            />
            <CategoryTiles categories={categories} totalProducts={productCount} />
          </Container>
        </section>
      )}

      <section className="pb-14 sm:pb-16">
        <Container>
          <SectionHeading
            title="All Products"
            subtitle={`${productCount} ${productCount === 1 ? "product" : "products"} across drones, parts and electronics`}
            action={{ label: "View all", href: "/shop" }}
          />
          <ProductGrid products={products} />
        </Container>
      </section>

      <section className="border-y border-line bg-subtle py-14 sm:py-16">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Why AstroArrox"
            title="Built for Professionals"
            subtitle="Everything you need to buy parts with confidence."
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ Icon, title, text }) => (
              <li key={title} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-text">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-10 text-white sm:px-10 sm:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgb(255_255_255/0.25)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.25)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_right,black,transparent_70%)]"
            />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-balance sm:text-4xl">Ready to Upgrade Your Setup?</h2>
                <ul className="mt-5 grid gap-x-6 gap-y-2 text-sm font-medium sm:grid-cols-2">
                  {["Cash on delivery", `Free shipping over ${freeShipping}`, "30-day returns", "1 year warranty"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/shop" size="lg" variant="onBrand">
                  Browse Collection
                </ButtonLink>
                <ButtonLink href={talkToUs} external size="lg" variant="onBrandOutline">
                  <WhatsAppIcon className="size-5" />
                  Talk to us
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
