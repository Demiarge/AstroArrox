import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/content/contact-form";
import { PageHeader } from "@/components/content/page-header";
import { FacebookIcon, WhatsAppIcon, YouTubeIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getSettings } from "@/lib/data/settings";
import { formatPhone, whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with AstroArrox by WhatsApp, email or our contact form.",
  alternates: { canonical: "/contact" },
};

const quickLinks = [
  { label: "Track your order", href: "/track-order" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Warranty", href: "/warranty" },
];

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader
        title="Contact Us"
        intro="Questions about a product, an order or a project? Send us a message."
        crumbs={[{ label: "Home", href: "/" }, { label: "Support", href: "/support" }, { label: "Contact" }]}
      />
      <Container className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[1fr_22rem]">
        <section className="relative rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-8">
          <h2 className="mb-5 text-xl font-bold">Send a message</h2>
          <ContactForm />
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h2 className="font-sans font-semibold">Fastest: WhatsApp</h2>
            <p className="mt-1 text-sm text-muted">Usually answered within a few hours.</p>
            <ButtonLink href={whatsappLink(s.whatsappNumber)} external variant="whatsapp" className="mt-4 w-full">
              <WhatsAppIcon className="size-4" />
              {formatPhone(s.whatsappNumber)}
            </ButtonLink>
            <ul className="mt-5 space-y-3 text-sm">
              {s.address && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                  {s.address}
                </li>
              )}
              {s.email && (
                <li>
                  <a href={`mailto:${s.email}`} className="flex gap-3 break-all hover:text-brand-text">
                    <Mail className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                    {s.email}
                  </a>
                </li>
              )}
              {s.facebookUrl && (
                <li>
                  <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-brand-text">
                    <FacebookIcon className="mt-0.5 size-4 shrink-0 text-muted" />
                    Facebook
                  </a>
                </li>
              )}
              {s.youtubeUrl && (
                <li>
                  <a href={s.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-brand-text">
                    <YouTubeIcon className="mt-0.5 size-4 shrink-0 text-muted" />
                    YouTube
                  </a>
                </li>
              )}
            </ul>
          </div>
          <nav aria-label="Quick links" className="rounded-2xl border border-line bg-surface p-2 shadow-card">
            {quickLinks.map((l) => (
              <Link key={l.href} href={l.href} className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-subtle">
                {l.label}
                <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            ))}
          </nav>
        </aside>
      </Container>
    </>
  );
}
