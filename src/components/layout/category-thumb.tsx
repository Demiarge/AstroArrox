import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/cn";

export function CategoryThumb({ imageUrl, className }: { imageUrl: string | null; className?: string }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-white", className)}>
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill sizes="48px" className="object-cover" />
      ) : (
        <Package className="size-5 text-muted" strokeWidth={1.5} aria-hidden />
      )}
    </span>
  );
}
