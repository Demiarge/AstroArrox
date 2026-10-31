import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { WhatsAppIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Markdown } from "@/components/ui/markdown";
import { FAQ_CATEGORIES, FAQ_CATEGORY_LABELS, getFaqItems } from "@/lib/data/content";
import { fillPlaceholders, getSettings } from "@/lib/data/settings";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about ordering, cash on delivery, shipping, returns, warranty and stock at AstroArrox.",
  alternates: { canonical: "/faq" },
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default async function FaqPage() {
  const [items, settings] = await Promise.all([getFaqItems(), getSettings()]);
  const groups = FAQ_CATEGORIES.map((c) => ({ category: c, label: FAQ_CATEGORY_LABELS[c], items: items.filter((i) => i.category === c) })).filter(
    (g) => g.items.length > 0,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: fillPlaceholders(i.answer, settings) },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader
        title="Frequently Asked Questions"
        intro="Quick answers about ordering, delivery, returns and our products."
        crumbs={[{ label: "Home", href: "/" }, { label: "Support", href: "/support" }, { label: "FAQ" }]}
      />
      <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="FAQ topics" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1 text-sm">
            {groups.map((g) => (
              <li key={g.category}>
                <a href={`#${slugify(g.label)}`} className="block rounded-lg px-3 py-2 font-medium text-muted hover:bg-subtle hover:text-foreground">
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-10">
          {groups.map((g) => (
            <section key={g.category} id={slugify(g.label)} className="scroll-mt-24">
              <h2 className="mb-4 text-xl font-bold">{g.label}</h2>
              <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                {g.items.map((item) => (
                  <details key={item.id} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium transition-colors hover:bg-subtle [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <ChevronDown className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
                    </summary>
                    <div className="px-5 pb-5 text-[15px]">
                      <Markdown>{fillPlaceholders(item.answer, settings)}</Markdown>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <div className="rounded-2xl border border-line bg-subtle p-6 text-center">
            <h2 className="text-lg font-bold">Still have a question?</h2>
            <p className="mt-1 text-sm text-muted">
              Message us on WhatsApp or use the{" "}
              <Link href="/contact" className="font-semibold text-brand-text hover:underline">
                contact form
              </Link>
              .
            </p>
            <ButtonLink href={whatsappLink(settings.whatsappNumber)} external variant="whatsapp" className="mt-4">
              <WhatsAppIcon className="size-4" />
              Chat on WhatsApp
            </ButtonLink>
          </div>
        </div>
      </Container>
    </>
  );
}
