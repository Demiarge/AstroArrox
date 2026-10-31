import type { Metadata } from "next";
import { MarkdownPage } from "@/components/content/markdown-page";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Delivery times, shipping fees, free shipping, and how to return an item to AstroArrox.",
  alternates: { canonical: "/shipping-returns" },
};

export default function ShippingReturnsPage() {
  return <MarkdownPage slug="shipping-returns" intro="How delivery works, what it costs, and how to return something." />;
}
