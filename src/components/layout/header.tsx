import Link from "next/link";
import { PackageSearch, UserRound } from "lucide-react";
import { CartButton } from "@/components/cart/cart-button";
import { WhatsAppIcon } from "@/components/icons";
import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { MobileSearch } from "@/components/layout/mobile-search";
import { iconButtonClass, navItemClass } from "@/components/layout/nav-styles";
import { SearchForm } from "@/components/layout/search-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Container } from "@/components/ui/container";
import { getNavCategories } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { whatsappLink } from "@/lib/format";
import { mainNav } from "@/lib/nav";

export async function Header() {
  const [settings, categories] = await Promise.all([getSettings(), getNavCategories()]);
  const logo = <Logo light={settings.logoLightUrl} dark={settings.logoDarkUrl} storeName={settings.storeName} eager />;
  const [home, shop, ...rest] = mainNav;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur-lg backdrop-saturate-150">
      <Container className="relative flex h-16 items-center gap-2 lg:h-[72px] lg:gap-4">
        <MobileMenu
          logo={logo}
          categories={categories}
          contact={{
            whatsappNumber: settings.whatsappNumber,
            email: settings.email,
            facebookUrl: settings.facebookUrl,
            youtubeUrl: settings.youtubeUrl,
          }}
        />

        <Link href="/" aria-label={`${settings.storeName} home`} className="shrink-0 rounded-lg">
          {logo}
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 lg:flex">
          {[home, shop].map((l) => (
            <Link key={l.href} href={l.href} className={navItemClass}>
              {l.label}
            </Link>
          ))}
          <MegaMenu categories={categories} />
          {rest.map((l) => (
            <Link key={l.href} href={l.href} className={navItemClass}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          {/* Below xl the nav needs the room, so MobileSearch's icon is used instead. */}
          <SearchForm className="mr-2 hidden w-72 xl:block" />
          <MobileSearch />
          <a
            href={whatsappLink(settings.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${iconButtonClass} hidden text-whatsapp sm:grid dark:text-success`}
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp"
          >
            <WhatsAppIcon className="size-5" />
          </a>
          <Link href="/track-order" className={`${iconButtonClass} hidden sm:grid`} aria-label="Track your order" title="Track your order">
            <PackageSearch className="size-5" aria-hidden />
          </Link>
          <ThemeToggle className="hidden lg:grid" />
          {/* Plain link keeps the header cacheable; /account handles logged-out visitors. */}
          <Link href="/account" className={iconButtonClass} aria-label="Your account" title="Your account">
            <UserRound className="size-5" aria-hidden />
          </Link>
          <CartButton />
        </div>
      </Container>
    </header>
  );
}
