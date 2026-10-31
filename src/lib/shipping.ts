export type ShippingRules = {
  insideDhakaFee: number;
  outsideDhakaFee: number;
  freeShippingThreshold: number;
};

export const isInsideDhaka = (district: string) => district.trim().toLowerCase() === "dhaka";

export function shippingFee(subtotal: number, district: string | null, rules: ShippingRules): number {
  if (subtotal <= 0 || subtotal >= rules.freeShippingThreshold) return 0;
  if (!district) return Math.min(rules.insideDhakaFee, rules.outsideDhakaFee);
  return isInsideDhaka(district) ? rules.insideDhakaFee : rules.outsideDhakaFee;
}

export function feeRange(rules: ShippingRules): [number, number] {
  return [Math.min(rules.insideDhakaFee, rules.outsideDhakaFee), Math.max(rules.insideDhakaFee, rules.outsideDhakaFee)];
}
