import Link from "next/link";
import { cacheLife } from "next/cache";
import { HandCoins, Mail, MapPin, RotateCcw, Truck } from "lucide-react";
import { FacebookIcon, WhatsAppIcon, YouTubeIcon } from "@/components/icons";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Container } from "@/components/ui/container";
import { getSettings } from "@/lib/data/settings";
import { formatPhone, formatTaka, whatsappLink } from "@/lib/format";
import { footerQuickLinks, footerSupportLinks, type NavLink } from "@/lib/nav";

// Cache Components only allows reading the clock in cached or deferred code.
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

function LinkColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div>
      <h2 className="font-sans text-sm font-semibold">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-muted transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const socialClass =
  "grid size-10 place-items-center rounded-xl border border-line bg-surface text-muted transition-colors hover:border-brand-text/40 hover:text-foreground";

export async function Footer() {
  const [s, year] = await Promise.all([getSettings(), currentYear()]);

  const trust = [
    { Icon: HandCoins, label: "Cash on Delivery" },
    { Icon: Truck, label: `Free Shipping ${formatTaka(s.freeShippingThreshold)}+` },
    { Icon: RotateCcw, label: "30-Day Returns" },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-subtle">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-16">
        <div className="sm:col-span-2 lg:col-span-4">
          <Link href="/" aria-label={`${s.storeName} home`} className="inline-block">
            <Logo light={s.logoLightUrl} dark={s.logoDarkUrl} storeName={s.storeName} />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Leading the frontier of consumer electronics and professional drone technology. Quality components for the next
            generation of builders.
          </p>
          <div className="mt-5 flex gap-2">
            {s.facebookUrl && (
              <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="Facebook">
                <FacebookIcon className="size-[18px]" />
              </a>
            )}
            {s.youtubeUrl && (
              <a href={s.youtubeUrl} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="YouTube">
                <YouTubeIcon className="size-[18px]" />
              </a>
            )}
            <a href={whatsappLink(s.whatsappNumber)} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="WhatsApp">
              <WhatsAppIcon className="size-[18px]" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-2">
          <LinkColumn title="Quick Links" links={footerQuickLinks} />
        </div>
        <div className="lg:col-span-2">
          <LinkColumn title="Support" links={footerSupportLinks} />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <h2 className="font-sans text-sm font-semibold">Stay in the Loop</h2>
          <p className="mt-4 text-sm text-muted">Get early access to product launches and exclusive member deals.</p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
          <ul className="mt-6 space-y-3 text-sm text-muted">
            {s.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{s.address}</span>
              </li>
            )}
            <li>
              <a href={whatsappLink(s.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-foreground">
                <WhatsAppIcon className="mt-0.5 size-4 shrink-0" />
                <span>{formatPhone(s.whatsappNumber)}</span>
              </a>
            </li>
            {s.email && (
              <li>
                <a href={`mailto:${s.email}`} className="flex gap-3 break-all hover:text-foreground">
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{s.email}</span>
                </a>
              </li>
            )}
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col-reverse items-center gap-4 py-6 text-sm text-muted md:flex-row md:justify-between">
          <p>
            © {year} {s.storeName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Why shop with us">
            {trust.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2 font-medium text-foreground/80">
                <Icon className="size-4 text-brand-text" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
