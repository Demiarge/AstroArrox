const takaFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** 7000 → "7,000৳" */
export function formatTaka(amount: number): string {
  return `${takaFormatter.format(amount)}৳`;
}

export function discountPercent(price: number, compareAtPrice: number | null | undefined): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.floor(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function whatsappLink(phone: string, text?: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("880") ? digits : `88${digits}`;
  return `https://wa.me/${intl}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** "01952018404" → "+880 1952-018404" */
export function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "").replace(/^880/, "0");
  return d.length === 11 ? `+880 ${d.slice(1, 5)}-${d.slice(5)}` : phone;
}
