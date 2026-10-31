import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronDown, FileText, Trash2 } from "lucide-react";
import { FaqForm } from "@/components/admin/content-forms";
import { PlaceholderHelp } from "@/components/admin/placeholder-help";
import { AdminPageHeader, Card } from "@/components/admin/ui";
import { deleteFaq, moveFaq } from "@/lib/actions/admin/content";
import { requireAdmin } from "@/lib/auth";
import { FAQ_CATEGORIES, FAQ_CATEGORY_LABELS, PAGE_SLUGS } from "@/lib/data/content";
import { formatDateTime } from "@/lib/dates";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Content" };

const iconBtn = "grid size-8 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-foreground disabled:opacity-30";

export default async function ContentPage() {
  await requireAdmin();
  const [pages, faqs] = await Promise.all([
    db.page.findMany({ where: { slug: { in: [...PAGE_SLUGS] } }, select: { slug: true, title: true, updatedAt: true } }),
    db.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  const categories = FAQ_CATEGORIES.map((value) => ({ value, label: FAQ_CATEGORY_LABELS[value] }));

  return (
    <>
      <AdminPageHeader title="Content" description="Edit the policy pages and the FAQ. Changes go live immediately." />

      <Card title="Pages" padded={false} className="mb-6">
        <ul className="divide-y divide-line">
          {PAGE_SLUGS.map((slug) => {
            const page = pages.find((p) => p.slug === slug);
            return (
              <li key={slug}>
                <Link href={`/admin/content/${slug}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-subtle">
                  <FileText className="size-4 text-brand-text" aria-hidden />
                  <span className="flex-1 font-medium">{page?.title ?? slug}</span>
                  <span className="text-xs text-muted">{page ? `Updated ${formatDateTime(page.updatedAt)}` : "Not created yet"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {categories.map((cat) => {
            const items = faqs.filter((f) => f.category === cat.value);
            return (
              <Card key={cat.value} title={`FAQ · ${cat.label} (${items.length})`} padded={false}>
                {items.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-muted">No questions in this group yet.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {items.map((f, i) => (
                      <li key={f.id}>
                        <details className="group">
                          <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 [&::-webkit-details-marker]:hidden">
                            <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                            <span className="flex-1 text-sm font-medium">{f.question}</span>
                          </summary>
                          <div className="space-y-3 border-t border-line bg-subtle/50 px-5 py-4">
                            <FaqForm faq={f} categories={categories} submitLabel="Save" />
                            <div className="flex items-center gap-1 border-t border-line pt-3">
                              <form action={moveFaq}>
                                <input type="hidden" name="id" value={f.id} />
                                <input type="hidden" name="dir" value="up" />
                                <button type="submit" className={iconBtn} disabled={i === 0} aria-label="Move up">
                                  <ArrowUp className="size-4" aria-hidden />
                                </button>
                              </form>
                              <form action={moveFaq}>
                                <input type="hidden" name="id" value={f.id} />
                                <input type="hidden" name="dir" value="down" />
                                <button type="submit" className={iconBtn} disabled={i === items.length - 1} aria-label="Move down">
                                  <ArrowDown className="size-4" aria-hidden />
                                </button>
                              </form>
                              <form action={deleteFaq} className="ml-auto">
                                <input type="hidden" name="id" value={f.id} />
                                <button type="submit" className={`${iconBtn} hover:text-sale`} aria-label="Delete question">
                                  <Trash2 className="size-4" aria-hidden />
                                </button>
                              </form>
                            </div>
                          </div>
                        </details>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
        <div className="space-y-6">
          <Card title="Add a question">
            <FaqForm faq={{ category: "", question: "", answer: "" }} categories={categories} submitLabel="Add question" />
          </Card>
          <PlaceholderHelp />
        </div>
      </div>
    </>
  );
}
