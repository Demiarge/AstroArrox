import type { Metadata } from "next";

// Every admin page reads the session cookie, so skip the instant-navigation checks.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · AstroArrox" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
