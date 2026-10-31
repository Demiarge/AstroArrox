import type { Metadata } from "next";
import { MarkdownPage } from "@/components/content/markdown-page";

export const metadata: Metadata = {
  title: "Warranty",
  description: "AstroArrox's 1-year warranty: what's covered, what isn't, and how to make a claim.",
  alternates: { canonical: "/warranty" },
};

export default function WarrantyPage() {
  return <MarkdownPage slug="warranty" intro="Every product is covered for a year against manufacturing defects." />;
}
