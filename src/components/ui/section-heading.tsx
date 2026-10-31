import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: string;
  action?: { label: string; href: string };
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({ title, subtitle, eyebrow, action, align = "left", as: Tag = "h2", className }: Props) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-6 flex gap-4 sm:mb-8",
        centered ? "flex-col items-center text-center" : "flex-wrap items-end justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow && <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-brand-text uppercase">{eyebrow}</p>}
        <Tag className="text-2xl font-bold text-balance sm:text-3xl">{title}</Tag>
        {subtitle && <p className="mt-2 text-pretty text-muted">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text hover:underline"
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
