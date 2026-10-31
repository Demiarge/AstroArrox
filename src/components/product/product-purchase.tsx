"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { MAX_PER_LINE, useCart, type CartProduct } from "@/lib/cart/store";
import { whatsappLink } from "@/lib/format";

type Props = {
  product: CartProduct;
  productUrl: string;
  whatsappNumber: string;
};

export function ProductPurchase({ product, productUrl, whatsappNumber }: Props) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const soldOut = product.stock <= 0;
  const max = Math.min(product.stock, MAX_PER_LINE);

  const message = `Hi! I'd like to order:\n${product.name}\nQuantity: ${qty}\n${productUrl}`;

  if (soldOut) {
    return (
      <div className="space-y-3">
        <Button size="lg" variant="secondary" disabled className="w-full">
          Out of stock
        </Button>
        <ButtonLink
          href={whatsappLink(whatsappNumber, `Hi! Is "${product.name}" coming back in stock?\n${productUrl}`)}
          external
          size="lg"
          variant="whatsapp"
          className="w-full"
        >
          <WhatsAppIcon className="size-5" />
          Ask about a restock
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <QuantityStepper value={qty} max={max} onChange={setQty} label="Quantity" />
        <Button
          size="lg"
          className="flex-1"
          onClick={() => {
            add(product, qty);
            openDrawer();
          }}
        >
          <ShoppingCart className="size-5" aria-hidden />
          Add to Cart
        </Button>
      </div>
      <ButtonLink href={whatsappLink(whatsappNumber, message)} external size="lg" variant="whatsapp" className="w-full">
        <WhatsAppIcon className="size-5" />
        Order on WhatsApp
      </ButtonLink>
    </div>
  );
}
