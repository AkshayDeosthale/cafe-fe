import type { CartLine } from "@/lib/types";

export function cartTotals(
  lines: CartLine[],
  discountType: "percent" | "flat",
  discountValue: number
): { subtotal: number; discount: number; taxAmount: number; total: number } {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const discount =
    discountType === "percent"
      ? Math.min(subtotal, (subtotal * discountValue) / 100)
      : Math.min(subtotal, discountValue);
  const taxable = subtotal - discount;
  // GST split proportionally across lines by each line's gstRate
  const taxAmount =
    subtotal === 0
      ? 0
      : lines.reduce((s, l) => {
          const lineShare = ((l.price * l.qty) / subtotal) * taxable;
          return s + (lineShare * l.gstRate) / 100;
        }, 0);
  const total = taxable + taxAmount;
  const round2 = (n: number) => Math.round(n * 100) / 100;
  return {
    subtotal: round2(subtotal),
    discount: round2(discount),
    taxAmount: round2(taxAmount),
    total: round2(total),
  };
}
