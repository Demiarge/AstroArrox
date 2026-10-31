import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { fillPlaceholders, getSettings } from "@/lib/data/settings";

export async function PromoBar() {
  const settings = await getSettings();
  const text = fillPlaceholders(settings.promoText, settings).trim();
  if (!text) return null;

  return (
    <div className="bg-brand text-white">
      <Container className="flex h-9 items-center justify-center gap-3 text-xs font-medium sm:justify-between sm:text-[13px]">
        <p className="flex items-center gap-2 truncate">
          <Truck className="size-4 shrink-0" aria-hidden />
          {text}
        </p>
        <Link href="/shop" className="group hidden items-center gap-1 font-semibold whitespace-nowrap hover:underline sm:inline-flex">
          Browse all products
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </Container>
    </div>
  );
}
