import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { WhatsAppIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Markdown } from "@/components/ui/markdown";
import { getPage, type PageSlug } from "@/lib/data/content";
import { fillPlaceholders, getSettings } from "@/lib/data/settings";
import { formatDate } from "@/lib/dates";
import { whatsappLink } from "@/lib/format";

const related: { label: string; href: string }[] = [
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Warranty Info", href: "/warranty" },
  { label: "FAQ", href: "/faq" },
  { label: "Track Your Order", href: "/track-order" },
  { label: "Our Story", href: "/our-story" },
];

export async function MarkdownPage({ slug, intro }: { slug: PageSlug; intro?: string }) {
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) notFound();

  return (
    <>
      <PageHeader title={page.title} intro={intro} crumbs={[{ label: "Home", href: "/" }, { label: page.title }]} />
      <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_18rem]">
        <article>
          <Markdown className="max-w-3xl text-[17px]">{fillPlaceholders(page.body, settings)}</Markdown>
          <p className="mt-10 text-sm text-muted">Last updated {formatDate(page.updatedAt)}</p>
        </article>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-sans font-semibold">
              <MessageCircle className="size-4 text-brand-text" aria-hidden />
              Questions?
            </h2>
            <p className="mt-2 text-sm text-muted">We’re happy to help with orders, returns and technical questions.</p>
            <ButtonLink href={whatsappLink(settings.whatsappNumber)} external variant="whatsapp" className="mt-4 w-full">
              <WhatsAppIcon className="size-4" />
              WhatsApp us
            </ButtonLink>
          </div>
          <nav aria-label="Related pages" className="rounded-2xl border border-line bg-surface p-2 shadow-card">
            {related
              .filter((r) => r.href !== `/${slug}`)
              .map((r) => (
                <Link key={r.href} href={r.href} className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-subtle">
                  {r.label}
                  <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              ))}
          </nav>
        </aside>
      </Container>
    </>
  );
}
