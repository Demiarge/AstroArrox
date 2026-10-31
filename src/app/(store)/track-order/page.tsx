import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/account/auth-panel";
import { TrackForm } from "@/components/orders/track-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your AstroArrox order with your order reference and phone number.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage({ searchParams }: PageProps<"/track-order">) {
  return (
    <Container className="max-w-md py-12 sm:py-16">
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-text">
          <PackageSearch className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold">Track your order</h1>
        <p className="mt-2 text-muted">Enter your order reference and the phone number (or email) you ordered with.</p>
      </div>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <Suspense fallback={<AuthFormSkeleton fields={2} />}>
          {searchParams.then((sp) => (
            <TrackForm defaultRef={typeof sp.ref === "string" ? sp.ref.slice(0, 20) : ""} />
          ))}
        </Suspense>
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Can’t find your order?{" "}
        <Link href="/contact" className="font-semibold text-brand-text hover:underline">
          Contact us
        </Link>
      </p>
    </Container>
  );
}
