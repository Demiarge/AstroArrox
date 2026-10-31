import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="font-heading text-7xl font-bold text-brand-text">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link href="/" className="font-semibold text-brand-text underline underline-offset-4">
        Go to the homepage
      </Link>
    </main>
  );
}
