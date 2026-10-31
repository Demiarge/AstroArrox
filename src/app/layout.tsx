import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { getSettings } from "@/lib/data/settings";
import { formatTaka } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "AstroArrox | Drones, Robotics & Electronics in Bangladesh",
      template: "%s | AstroArrox",
    },
    description: `Drones, RC planes, robotics and electronics components in Bangladesh. Cash on delivery, free shipping over ${formatTaka(s.freeShippingThreshold)} and a 1-year warranty.`,
    applicationName: "AstroArrox",
    openGraph: { type: "website", siteName: "AstroArrox", locale: "en_BD" },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#2838eb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes sets the `dark` class before hydration.
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
