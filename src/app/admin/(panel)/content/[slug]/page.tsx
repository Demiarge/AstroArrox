import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageForm } from "@/components/admin/content-forms";
import { PlaceholderHelp } from "@/components/admin/placeholder-help";
import { AdminPageHeader, Card } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { PAGE_SLUGS, type PageSlug } from "@/lib/data/content";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit page" };

export default async function EditContentPage({ params }: PageProps<"/admin/content/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  if (!PAGE_SLUGS.includes(slug as PageSlug)) notFound();
  const page = await db.page.findUnique({ where: { slug } });

  return (
    <>
      <AdminPageHeader
        back={{ label: "Content", href: "/admin/content" }}
        title={page?.title ?? slug}
        actions={
          <ButtonLink href={`/${slug}`} external variant="secondary" size="sm">
            <ExternalLink className="size-4" aria-hidden />
            View page
          </ButtonLink>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card>
          <PageForm slug={slug} title={page?.title ?? ""} body={page?.body ?? ""} />
        </Card>
        <PlaceholderHelp />
      </div>
    </>
  );
}
