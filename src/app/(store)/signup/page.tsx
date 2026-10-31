import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Suspense } from "react";
import { SignupForm } from "@/components/account/account-forms";
import { AuthFormSkeleton, AuthPanel } from "@/components/account/auth-panel";
import { getCurrentUser, safeNextPath } from "@/lib/user-auth";

export const metadata: Metadata = { title: "Create an account", robots: { index: false, follow: false } };

export default function SignupPage({ searchParams }: PageProps<"/signup">) {
  return (
    <AuthPanel Icon={UserPlus} title="Create an account" intro="You need an account to place orders. You’ll see all of them in one place.">
      <Suspense fallback={<AuthFormSkeleton fields={4} />}>
        <SignupContent searchParams={searchParams} />
      </Suspense>
    </AuthPanel>
  );
}

async function SignupContent({ searchParams }: Pick<PageProps<"/signup">, "searchParams">) {
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next || "/account");
  return (
    <>
      <SignupForm next={next} />
      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-brand-text hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
