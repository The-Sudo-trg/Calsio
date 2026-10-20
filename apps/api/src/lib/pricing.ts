/**
 * pricing.ts — pure commerce math (§6.4, §11-A test targets).
 * All money in whole INR rupees.
 */

export const FREE_SHIPPING_THRESHOLD = 1499;
export const SHIPPING_FEE = 99;

export type CartLine = { price: number; quantity: number };

export type Totals = {
  subtotal: number; // sum of unit prices * qty
  unitCount: number;
  shippingFee: number; // 0 when subtotal >= FREE_SHIPPING_THRESHOLD
  total: number;
  freeShippingUnlocked: boolean;
  freeShippingRemaining: number; // ₹ left to unlock, 0 when unlocked
};

export function computeTotals(lines: CartLine[]): Totals {
  const subtotal = lines.reduce((acc, l) => acc + l.price * l.quantity, 0);
  const unitCount = lines.reduce((acc, l) => acc + l.quantity, 0);
  const freeShippingUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = freeShippingUnlocked ? 0 : SHIPPING_FEE;
  return {
    subtotal,
    unitCount,
    shippingFee,
    total: subtotal + shippingFee,
    freeShippingUnlocked,
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}

/** Discount policy hook for Phase 2.1 promos — identity for now, never negative totals. */
export function applyDiscount(totals: Totals, discountPct = 0): Totals {
  const pct = Math.min(Math.max(discountPct, 0), 100);
  const total = Math.max(0, Math.round((totals.total * (100 - pct)) / 100));
  return { ...totals, total };
}
