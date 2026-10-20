/**
 * rupee.ts — ₹ formatting with Indian digit grouping.
 * Master prompt §5: every price renders as ₹ with Indian digit grouping (₹2,499).
 * Pure functions — unit-tested in Phase 4 (§11-A).
 */

/** 2499 → "₹2,499" · 150000.5 → "₹1,50,001" (rounded) */
export function formatINR(amount: number, opts: { decimals?: boolean } = {}): string {
  if (!Number.isFinite(amount)) return '₹—';
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const rounded = opts.decimals ? abs : Math.round(abs);
  const grouped = indianGrouping(rounded, opts.decimals ? 2 : 0);
  const sign = negative ? '-₹' : '₹';
  return `${sign}${grouped}`;
}

function indianGrouping(value: number, decimals: number): string {
  const [intPart, decPart] = truncatedParts(value, decimals);
  const last3 = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const head = grouped ? `${grouped},${last3}` : last3;
  return decPart ? `${head}.${decPart}` : head;
}

function truncatedParts(value: number, decimals: number): [string, string | undefined] {
  const fixed = value.toFixed(decimals);
  const [i, d] = fixed.split('.');
  return [i === '-0' ? '0' : i, decimals > 0 ? d : undefined];
}

/** Compare helper for price-range filters. */
export function inrCents(amount: number): number {
  return Math.round(amount * 100);
}
