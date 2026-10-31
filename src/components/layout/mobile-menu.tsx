"use client";

import Link from "next/link";
import { ChevronRight, Mail, Menu, ShoppingCart, UserRound, X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { FacebookIcon, WhatsAppIcon, YouTubeIcon } from "@/components/icons";
import { CategoryThumb } from "@/components/layout/category-thumb";
import { iconButtonClass } from "@/components/layout/nav-styles";
import { ThemeSwitch } from "@/components/theme/theme-toggle";
import type { NavCategory } from "@/lib/data/catalog";
import { whatsappLink } from "@/lib/format";
import { categoryHref, helpLinks, mobileShopLinks } from "@/lib/nav";

type Props = {
  logo: ReactNode;
  categories: NavCategory[];
  contact: { whatsappNumber: string; email: string; facebookUrl: string; youtubeUrl: string };
};

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 px-3 font-sans text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{children}</h2>;
}

const rowClass = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-subtle";

export function MobileMenu({ logo, categories, contact }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        className={`${iconButtonClass} -ml-2 lg:hidden`}
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Menu className="size-6" aria-hidden />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        // Backdrop clicks target the <dialog> itself.
        onClick={(e) => e.target === e.currentTarget && close()}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none -translate-x-full bg-surface p-0 text-foreground shadow-2xl transition-[translate,display,overlay] transition-discrete duration-300 ease-out backdrop:bg-black/50 backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-300 open:translate-x-0 open:backdrop:opacity-100 starting:open:-translate-x-full starting:open:backdrop:opacity-0"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
            <Link href="/" onClick={close} aria-label="Home">
              {logo}
            </Link>
            <button type="button" className={iconButtonClass} onClick={close} aria-label="Close menu" autoFocus>
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-2 py-5">
            <section>
              <SectionTitle>Shop</SectionTitle>
              <ul>
                {mobileShopLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={close} className={rowClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {categories.length > 0 && (
              <section>
                <SectionTitle>Categories</SectionTitle>
                <ul>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link href={categoryHref(c.slug)} onClick={close} className={rowClass}>
                        <CategoryThumb imageUrl={c.imageUrl} className="size-9" />
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="text-xs text-muted tabular-nums">{c.productCount}</span>
                        <ChevronRight className="size-4 text-muted" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <SectionTitle>Help</SectionTitle>
              <ul>
                {helpLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={close} className={rowClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/cart" onClick={close} className={rowClass}>
                    <ShoppingCart className="size-4 text-muted" aria-hidden />
                    View Cart
                  </Link>
                </li>
                <li>
                  <Link href="/account" onClick={close} className={rowClass}>
                    <UserRound className="size-4 text-muted" aria-hidden />
                    Your Account
                  </Link>
                </li>
              </ul>
            </section>

            <section className="px-1">
              <SectionTitle>Appearance</SectionTitle>
              <div className="px-2">
                <ThemeSwitch />
              </div>
            </section>
          </nav>

          <div className="shrink-0 border-t border-line p-4">
            <a
              href={whatsappLink(contact.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-whatsapp text-sm font-semibold text-white hover:bg-whatsapp-hover"
            >
              <WhatsAppIcon className="size-5" />
              Chat on WhatsApp
            </a>
            <div className="mt-3 flex items-center justify-center gap-1">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className={iconButtonClass} aria-label="Email us">
                  <Mail className="size-5" aria-hidden />
                </a>
              )}
              {contact.facebookUrl && (
                <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer" className={iconButtonClass} aria-label="Facebook">
                  <FacebookIcon className="size-5" />
                </a>
              )}
              {contact.youtubeUrl && (
                <a href={contact.youtubeUrl} target="_blank" rel="noopener noreferrer" className={iconButtonClass} aria-label="YouTube">
                  <YouTubeIcon className="size-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
