import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp" | "danger" | "onBrand" | "onBrandOutline";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200 " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-sm hover:bg-brand-hover",
  secondary: "border border-line bg-surface text-foreground hover:border-brand-text/40 hover:bg-subtle",
  ghost: "text-foreground hover:bg-subtle",
  whatsapp: "bg-whatsapp text-white shadow-sm hover:bg-whatsapp-hover",
  danger: "bg-sale-solid text-white shadow-sm hover:opacity-90",
  onBrand: "bg-white text-brand shadow-sm hover:bg-white/90",
  onBrandOutline: "border border-white/40 text-white hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-10",
};

type StyleProps = { variant?: Variant; size?: Size; className?: string };

export function buttonClasses({ variant = "primary", size = "md", className }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = StyleProps & ComponentProps<"button">;

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

type ButtonLinkProps = StyleProps & ComponentProps<typeof Link> & { external?: boolean };

/** `external` opens in a new tab. */
export function ButtonLink({ variant, size, className, external, ...props }: ButtonLinkProps) {
  const extra = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return <Link className={buttonClasses({ variant, size, className })} {...extra} {...props} />;
}
