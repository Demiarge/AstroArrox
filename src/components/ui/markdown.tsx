import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/cn";

/** Raw HTML is skipped so admin content can't inject scripts. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-aa", className)}>
      <ReactMarkdown
        skipHtml
        components={{
          a: ({ href = "", children }) =>
            // "//host" and "/\host" are other sites.
            /^\/(?![/\\])/.test(href) ? (
              <Link href={href}>{children}</Link>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
