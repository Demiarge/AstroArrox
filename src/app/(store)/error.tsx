"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function StoreError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center py-20 text-center sm:py-28">
      <p className="font-heading text-5xl font-bold text-brand-text">Oops</p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted">
        This page didn’t load properly. Please try again. If it keeps happening, message us on WhatsApp and we’ll help.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </Button>
        <ButtonLink href="https://wa.me/8801952018404" external variant="whatsapp">
          <WhatsAppIcon className="size-4" />
          WhatsApp us
        </ButtonLink>
      </div>
    </Container>
  );
}
