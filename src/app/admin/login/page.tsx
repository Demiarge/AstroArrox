import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="grid min-h-dvh place-items-center bg-subtle p-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-heading text-2xl font-bold">
          Astro<span className="text-brand-text">Arrox</span> <span className="text-base font-medium text-muted">Admin</span>
        </p>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h1 className="mb-5 text-xl font-bold">Log in</h1>
          <Suspense>
            {searchParams.then((sp) => (
              <LoginForm next={typeof sp.next === "string" ? sp.next : ""} />
            ))}
          </Suspense>
        </div>
      </div>
    </main>
  );
}
