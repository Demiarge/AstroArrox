import { isPrintingCategory, PRINTING_LABEL, PRINTING_PATH } from "@/lib/3d-printing";

export type NavLink = { label: string; href: string };

export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  // The "Categories" mega-menu goes here; it's rendered separately.
  { label: PRINTING_LABEL, href: PRINTING_PATH },
  { label: "Deals", href: "/shop?sale=1" },
  { label: "Support", href: "/support" },
];

export const mobileShopLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/shop" },
  { label: PRINTING_LABEL, href: PRINTING_PATH },
  { label: "Deals", href: "/shop?sale=1" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
];

export const helpLinks: NavLink[] = [
  { label: "Track Your Order", href: "/track-order" },
  { label: "Support Center", href: "/support" },
  { label: "Contact Us", href: "/contact" },
];

export const footerQuickLinks: NavLink[] = [
  { label: "Shop All Products", href: "/shop" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Special Offers", href: "/shop?sale=1" },
  { label: "Support Center", href: "/support" },
  { label: "Our Story", href: "/our-story" },
];

export const footerSupportLinks: NavLink[] = [
  { label: "Track Your Order", href: "/track-order" },
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Warranty Info", href: "/warranty" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

export const categoryHref = (slug: string) =>
  isPrintingCategory(slug) ? PRINTING_PATH : `/shop?category=${encodeURIComponent(slug)}`;
