import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  light: string | null;
  dark: string | null;
  storeName: string;
  className?: string;
  /** Above the fold only: both theme versions download. */
  eager?: boolean;
};

export function Logo({ light, dark, storeName, className, eager }: Props) {
  if (!light) {
    return <span className={cn("font-heading text-xl font-bold tracking-tight", className)}>{storeName}</span>;
  }
  const size = cn("h-9 w-auto", className);
  // Not preload: a preload link can't follow the class-based theme.
  const loading = eager ? "eager" : undefined;
  return (
    <>
      <Image src={light} alt={storeName} width={160} height={40} loading={loading} className={cn(size, dark && "dark:hidden")} />
      {dark && <Image src={dark} alt={storeName} width={160} height={40} loading={loading} className={cn(size, "hidden dark:block")} />}
    </>
  );
}
