import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, CircleX, HandCoins, RotateCcw, ShieldCheck, Truck, TriangleAlert } from "lucide-react";
import { toCartProductFromDetail } from "@/components/product/cart-mapping";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPurchase } from "@/components/product/product-purchase";
import { LOW_STOCK_THRESHOLD } from "@/components/product/stock-note";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { Markdown } from "@/components/ui/markdown";
import { Price } from "@/components/ui/price";
import { SectionHeading } from "@/components/ui/section-heading";
import { isPrintingCategory, PRINTING_LABEL, PRINTING_PATH } from "@/lib/3d-printing";
import { getProductBySlug, getProductSlugs, getRelatedProducts } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { discountPercent, formatTaka } from "@/lib/format";
import { categoryHref } from "@/lib/nav";
import { absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  // Cache Components needs at least one param to validate the route.
  return slugs.length ? slugs.map(({ slug }) => ({ slug })) : [{ slug: "__none__" }];
}

const summary = (md: string) =>
  md.replace(/[#*_`>\[\]()!-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const description = summary(product.description) || `${product.name}, ${formatTaka(product.price)}. Cash on delivery across Bangladesh.`;
  const image = product.images[0];
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/product/${product.slug}`,
      images: image ? [{ url: image.url, alt: image.alt || product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related] = await Promise.all([getSettings(), getRelatedProducts(product.category.id, product.id)]);
  const off = discountPercent(product.price, product.compareAtPrice);
  const saved = product.compareAtPrice && off > 0 ? product.compareAtPrice - product.price : 0;
  const url = absoluteUrl(`/product/${product.slug}`);

  const stock =
    product.stock <= 0
      ? { Icon: CircleX, text: "Out of stock", className: "text-muted" }
      : product.stock <= LOW_STOCK_THRESHOLD
        ? { Icon: TriangleAlert, text: `Low stock · only ${product.stock} left`, className: "text-warn" }
        : { Icon: CircleCheck, text: "In stock", className: "text-success" };

  const perks = [
    { Icon: Truck, text: `Free shipping over ${formatTaka(settings.freeShippingThreshold)}` },
    { Icon: RotateCcw, text: "30-day returns" },
    { Icon: ShieldCheck, text: "1 year warranty" },
    { Icon: HandCoins, text: "Cash on delivery" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    url,
    image: product.images.map((i) => absoluteUrl(i.url)),
    description: summary(product.description) || undefined,
    category: product.category.name,
    brand: { "@type": "Brand", name: settings.storeName },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BDT",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: settings.storeName },
    },
  };

  const badges =
    off > 0 || product.isNew ? (
      <div className="pointer-events-none absolute top-4 left-4 flex flex-col items-start gap-1.5">
        {off > 0 && <Badge tone="sale">-{off}%</Badge>}
        {product.isNew && <Badge tone="new">New</Badge>}
      </div>
    ) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Container className="py-6 sm:py-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            ...(isPrintingCategory(product.category.slug)
              ? [{ label: PRINTING_LABEL, href: PRINTING_PATH }]
              : [
                  { label: "Shop", href: "/shop" },
                  { label: product.category.name, href: categoryHref(product.category.slug) },
                ]),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={product.images} name={product.name} overlay={badges} />

          <div className="lg:py-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <Link href={categoryHref(product.category.slug)} className="font-semibold text-brand-text hover:underline">
                {product.category.name}
              </Link>
              <span className="text-muted">SKU: {product.sku}</span>
            </div>
            <h1 className="mt-2 text-2xl leading-tight font-bold text-balance sm:text-3xl lg:text-4xl">{product.name}</h1>

            <div className="mt-5">
              <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
              {saved > 0 && (
                <p className="mt-1 text-sm font-semibold text-sale">
                  You save {formatTaka(saved)} ({off}%)
                </p>
              )}
            </div>

            <p className={`mt-4 flex items-center gap-2 text-sm font-medium ${stock.className}`}>
              <stock.Icon className="size-4" aria-hidden />
              {stock.text}
            </p>

            <div className="mt-6">
              <ProductPurchase product={toCartProductFromDetail(product)} productUrl={url} whatsappNumber={settings.whatsappNumber} />
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-subtle p-4 text-sm">
              {perks.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0 text-brand-text" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12">
          <section aria-labelledby="description">
            <h2 id="description" className="mb-4 text-xl font-bold">
              Description
            </h2>
            {product.description.trim() ? (
              <Markdown>{product.description}</Markdown>
            ) : (
              <p className="text-muted">No description yet. Message us on WhatsApp if you have questions about this product.</p>
            )}
          </section>

          {product.specs.length > 0 && (
            <section aria-labelledby="specs">
              <h2 id="specs" className="mb-4 text-xl font-bold">
                Specifications
              </h2>
              <div className="overflow-hidden rounded-2xl border border-line">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specs.map((s, i) => (
                      <tr key={`${s.key}-${i}`} className="border-b border-line last:border-0 odd:bg-subtle">
                        <th scope="row" className="w-2/5 px-4 py-2.5 text-left font-medium text-muted">
                          {s.key}
                        </th>
                        <td className="px-4 py-2.5">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <SectionHeading title="You may also like" action={{ label: "View all", href: categoryHref(product.category.slug) }} />
            <ProductGrid products={related} />
          </section>
        )}
      </Container>
    </>
  );
}
