import type { Metadata } from "next";
import { MarkdownPage } from "@/components/content/markdown-page";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Why AstroArrox exists: professional electronics and drone technology at fair prices for makers, students and professionals.",
  alternates: { canonical: "/our-story" },
};

export default function OurStoryPage() {
  return <MarkdownPage slug="our-story" intro="Built by engineers and hobbyists, for the next generation of builders." />;
}
