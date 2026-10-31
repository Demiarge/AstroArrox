import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, CircleHelp, Mail, MapPin, MessageSquare, PackageSearch, RotateCcw, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { WhatsAppIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getSettings } from "@/lib/data/settings";
import { formatPhone, whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Support Center",
  description: "Track an order, read our shipping, returns and warranty policies, or get in touch with AstroArrox.",
  alternates: { canonical: "/support" },
};

const topics = [
  { Icon: PackageSearch, title: "Track Your Order", text: "See where your order is with your reference and phone number.", href: "/track-order" },
  { Icon: RotateCcw, title: "Shipping & Returns", text: "Delivery times, fees and how to return an item.", href: "/shipping-returns" },
  { Icon: ShieldCheck, title: "Warranty Info", text: "What our 1-year warranty covers and how to claim.", href: "/warranty" },
  { Icon: CircleHelp, title: "FAQ", text: "Quick answers to the most common questions.", href: "/faq" },
  { Icon: MessageSquare, title: "Contact Us", text: "Send us a message and we’ll get back to you.", href: "/contact" },
  { Icon: BookOpen, title: "Our Story", text: "Who we are and why we started AstroArrox.", href: "/our-story" },
];

const checklist = [
  "Have your order reference ready (it looks like AA-7K2Q9M).",
  "For defects, attach clear photos or a video of the problem.",
  "Returns must start within 30 days of delivery.",
  "Check the FAQ first. Your answer may already be there.",
];

export default async function SupportPage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader
        title="Support Center"
        intro="How can we help? Pick a topic below or reach us directly."
        crumbs={[{ label: "Home", href: "/" }, { label: "Support" }]}
      />
      <Container className="space-y-14 py-10 sm:py-14">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(({ Icon, title, text, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-card transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-brand-text/30 hover:shadow-card-hover"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-text">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h2 className="mt-4 flex items-center gap-1.5 text-lg font-semibold group-hover:text-brand-text">
                  {title}
                  <ArrowRight className="size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                </h2>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
          <section className="rounded-2xl border border-line bg-subtle p-6 sm:p-8">
            <h2 className="text-xl font-bold">Before You Contact Us</h2>
            <ul className="mt-5 space-y-3">
              {checklist.map((c) => (
                <li key={c} className="flex gap-3 text-[15px]">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-text" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
            <h2 className="text-xl font-bold">Reach Us</h2>
            <p className="mt-1 text-sm text-muted">WhatsApp is the fastest way to reach us.</p>
            <ButtonLink href={whatsappLink(s.whatsappNumber)} external variant="whatsapp" size="lg" className="mt-5 w-full sm:w-auto">
              <WhatsAppIcon className="size-5" />
              Chat on WhatsApp
            </ButtonLink>
            <ul className="mt-6 space-y-3 text-[15px]">
              <li>
                <a href={whatsappLink(s.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-brand-text">
                  <WhatsAppIcon className="mt-0.5 size-5 shrink-0 text-muted" />
                  {formatPhone(s.whatsappNumber)}
                </a>
              </li>
              {s.email && (
                <li>
                  <a href={`mailto:${s.email}`} className="flex gap-3 break-all hover:text-brand-text">
                    <Mail className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
                    {s.email}
                  </a>
                </li>
              )}
              {s.address && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
                  {s.address}
                </li>
              )}
            </ul>
            <Link href="/contact" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text hover:underline">
              Send a message
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </section>
        </div>
      </Container>
    </>
  );
}
