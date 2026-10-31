import type { Metadata } from "next";
import { Compass, Search } from "lucide-react";
import { SearchForm } from "@/components/layout/search-form";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-20 text-center sm:py-28">
      <p className="font-heading text-7xl font-bold text-brand-text sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">We couldn’t find that page</h1>
      <p className="mt-2 max-w-md text-muted">The link may be old, or the product may no longer be available. Try searching instead.</p>
      <div className="mt-8 w-full max-w-sm">
        <SearchForm />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/shop">
          <Search className="size-4" aria-hidden />
          Browse all products
        </ButtonLink>
        <ButtonLink href="/" variant="secondary">
          <Compass className="size-4" aria-hidden />
          Go home
        </ButtonLink>
      </div>
    </Container>
  );
}
