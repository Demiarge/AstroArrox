import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthPanel({ Icon, title, intro, children }: { Icon: LucideIcon; title: string; intro: string; children: ReactNode }) {
  return (
    <Container className="max-w-md py-12 sm:py-16">
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-text">
          <Icon className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted">{intro}</p>
      </div>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">{children}</div>
    </Container>
  );
}

export function AuthFormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: fields }, (_, i) => (
        <Skeleton key={i} className="h-[4.5rem] rounded-xl" />
      ))}
      <Skeleton className="h-12 rounded-xl" />
    </div>
  );
}
