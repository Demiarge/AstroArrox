"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchForm } from "@/components/layout/search-form";
import { Container } from "@/components/ui/container";

export function MobileSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-search"
        aria-label={open ? "Close search" : "Search"}
        className="grid size-10 place-items-center rounded-xl hover:bg-subtle xl:hidden"
      >
        {open ? <X className="size-5" aria-hidden /> : <Search className="size-5" aria-hidden />}
      </button>
      {open && (
        <div
          id="mobile-search"
          // Submit bubbles up from SearchForm's form.
          onSubmit={() => setOpen(false)}
          className="absolute inset-x-0 top-full border-b border-line bg-background/95 py-3 backdrop-blur-md xl:hidden"
        >
          <Container>
            <SearchForm autoFocus />
          </Container>
        </div>
      )}
    </>
  );
}
