import type { Metadata } from "next";
import { Clock, FileUp, Hash, Layers, MessageSquareQuote, PackageCheck, Palette, Printer, Ruler, Send, Tag } from "lucide-react";
import { Suspense } from "react";
import { PageHeader } from "@/components/content/page-header";
import { WhatsAppIcon } from "@/components/icons";
import { ProductGrid, productGridClass } from "@/components/product/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { PRINTING_CATEGORY_SLUG, PRINTING_LABEL, PRINTING_PATH } from "@/lib/3d-printing";
import { getShopProducts } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { whatsappLink } from "@/lib/format";
import { parseShopQuery } from "@/lib/shop-query";

const description =
  "Ready-made 3D prints and custom 3D printing in Bangladesh. Send us your file or idea on WhatsApp for a quote. Cash on delivery.";

// No `openGraph` on purpose: it would replace the root one and drop the default image.
export const metadata: Metadata = {
  title: PRINTING_LABEL,
  description,
  alternates: { canonical: PRINTING_PATH },
};

const QUOTE_MESSAGE = "Hi, I'd like a custom 3D print quote.";

// Placeholders until the owner confirms them (docs/TODO-confirm.md, items 15–17).
const MATERIALS = ["PLA", "PETG", "TPU (flexible)", "ABS"];
const TURNAROUND = "Usually 3–5 business days after you approve the quote";
const PRICE_NOTE = "Price depends on the size of the print and the material. You get the exact price before we start.";

const steps = [
  { Icon: Send, title: "Send your idea or file", text: "Message us on WhatsApp with a 3D file, a photo or a sketch." },
  { Icon: MessageSquareQuote, title: "We quote price and time", text: "We check your design and reply with the price and when it’ll be ready." },
  { Icon: PackageCheck, title: "We print and deliver", text: "Once you approve, we print it and deliver it to your door. Pay Cash on Delivery." },
];

const toSend = [
  { Icon: FileUp, text: "An STL or 3MF file, or a photo or sketch of what you need" },
  { Icon: Ruler, text: "Approximate size (length × width × height)" },
  { Icon: Palette, text: "Colour" },
  { Icon: Hash, text: "Quantity" },
];

const READY_MADE_ID = "ready-made";
const CUSTOM_ID = "custom";
// Clears the sticky header when jumping to an anchor.
const anchorClass = "scroll-mt-20 lg:scroll-mt-24";

const pageHref = (page: number) => `${page > 1 ? `${PRINTING_PATH}?page=${page}` : PRINTING_PATH}#${READY_MADE_ID}`;

export default async function PrintingPage({ searchParams }: PageProps<"/3d-printing">) {
  const settings = await getSettings();
  const quoteHref = whatsappLink(settings.whatsappNumber, QUOTE_MESSAGE);

  return (
    <>
      <PageHeader
        title={PRINTING_LABEL}
        intro="Ready-made prints you can order today, and custom prints made from your own file or idea."
        crumbs={[{ label: "Home", href: "/" }, { label: PRINTING_LABEL }]}
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={quoteHref} external variant="whatsapp" size="lg" className="w-full sm:w-auto">
            <WhatsAppIcon className="size-5" />
            Request a custom print
          </ButtonLink>
          <ButtonLink href={`#${READY_MADE_ID}`} variant="secondary" size="lg" className="w-full sm:w-auto">
            Shop ready-made prints
          </ButtonLink>
        </div>
      </PageHeader>

      <Container className="space-y-16 py-10 sm:space-y-20 sm:py-14">
        <section id={READY_MADE_ID} className={anchorClass}>
          <SectionHeading title="Ready-made prints" subtitle="Printed and ready to ship. Add them to your cart and pay Cash on Delivery." />
          <Suspense fallback={<GridSkeleton />}>
            <ReadyMadePrints searchParams={searchParams} />
          </Suspense>
        </section>

        <section id={CUSTOM_ID} className={anchorClass}>
          <SectionHeading
            title="Custom prints"
            subtitle="Have a design, or just an idea? We’ll print it for you. Custom jobs are quoted on WhatsApp."
          />

          <h3 className="text-lg font-semibold">How it works</h3>
          <ol className="mt-4 grid gap-4 md:grid-cols-3">
            {steps.map(({ Icon, title, text }, i) => (
              <li key={title} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-text">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold tracking-wider text-muted uppercase">Step {i + 1}</span>
                </div>
                <h4 className="mt-4 text-lg font-semibold">{title}</h4>
                <p className="mt-1.5 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
            <div className="rounded-2xl border border-line bg-subtle p-6 sm:p-8">
              <h3 className="text-lg font-semibold">What to send us</h3>
              <ul className="mt-5 space-y-3">
                {toSend.map(({ Icon, text }) => (
                  <li key={text} className="flex gap-3 text-[15px]">
                    <Icon className="mt-0.5 size-5 shrink-0 text-brand-text" aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
              <h3 className="text-lg font-semibold">Materials, timing and price</h3>
              <dl className="mt-5 space-y-5 text-[15px]">
                <div className="flex gap-3">
                  <Layers className="mt-0.5 size-5 shrink-0 text-brand-text" aria-hidden />
                  <div className="min-w-0">
                    <dt className="font-medium">Materials</dt>
                    <dd className="mt-2">
                      <ul className="flex flex-wrap gap-2">
                        {MATERIALS.map((m) => (
                          <li key={m} className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-text">
                            {m}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-brand-text" aria-hidden />
                  <div className="min-w-0">
                    <dt className="font-medium">Turnaround</dt>
                    <dd className="mt-1 text-muted">
                      {TURNAROUND}, plus delivery ({settings.deliveryTimeText}).
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Tag className="mt-0.5 size-5 shrink-0 text-brand-text" aria-hidden />
                  <div className="min-w-0">
                    <dt className="font-medium">Price</dt>
                    <dd className="mt-1 text-muted">{PRICE_NOTE}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-6 rounded-3xl border border-brand/25 bg-brand-soft p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-balance sm:text-3xl">Ready to print your idea?</h3>
              <p className="mt-2 text-pretty text-muted">Send us your file or idea on WhatsApp and we’ll reply with a quote.</p>
            </div>
            <ButtonLink href={quoteHref} external variant="whatsapp" size="lg" className="w-full sm:w-auto">
              <WhatsAppIcon className="size-5" />
              Request a custom print
            </ButtonLink>
          </div>
        </section>
      </Container>
    </>
  );
}

async function ReadyMadePrints({ searchParams }: Pick<PageProps<"/3d-printing">, "searchParams">) {
  const { page } = await searchParams;
  const result = await getShopProducts(parseShopQuery({ category: PRINTING_CATEGORY_SLUG, page }));

  if (result.items.length === 0) {
    return (
      <EmptyState
        icon={Printer}
        title="No ready-made prints right now"
        action={
          <ButtonLink href={`#${CUSTOM_ID}`} variant="secondary">
            See custom printing
          </ButtonLink>
        }
      >
        New prints are on the way. In the meantime, we can print something just for you.
      </EmptyState>
    );
  }

  return (
    <>
      <ProductGrid products={result.items} />
      <Pagination page={result.page} pageCount={result.pageCount} href={pageHref} />
    </>
  );
}

function GridSkeleton() {
  return (
    <div className={productGridClass} aria-busy="true">
      {Array.from({ length: 4 }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
