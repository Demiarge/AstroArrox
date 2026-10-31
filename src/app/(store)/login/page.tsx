import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { Suspense } from "react";
import { CustomerLoginForm } from "@/components/account/account-forms";
import { AuthFormSkeleton, AuthPanel } from "@/components/account/auth-panel";
import { getCurrentUser, safeNextPath } from "@/lib/user-auth";

export const metadata: Metadata = { title: "Log in", robots: { index: false, follow: false } };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthPanel Icon={LogIn} title="Log in" intro="Welcome back. Log in to your AstroArrox account.">
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </AuthPanel>
  );
}

async function LoginContent({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next || "/account");
  return (
    <>
      {next === "/checkout" && (
        <p role="status" className="mb-4 rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-text">
          Log in or create an account to place your order. Your cart is saved.
        </p>
      )}
      <CustomerLoginForm next={next} />
      <p className="mt-5 text-center text-sm text-muted">
        New here?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-brand-text hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
