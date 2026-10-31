import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";

export function PageHeader({ title, intro, crumbs, children }: { title: string; intro?: ReactNode; crumbs: Crumb[]; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_90%_at_10%_0%,var(--brand-soft),transparent_70%)]"
      />
      <Container className="relative py-8 sm:py-12">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-4 text-3xl font-bold text-balance sm:text-4xl lg:text-5xl">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-lg text-pretty text-muted">{intro}</p>}
        {children}
      </Container>
    </section>
  );
}
