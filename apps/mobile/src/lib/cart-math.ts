/**
 * cart-math.ts — client mirror of apps/api pricing constants (single rulebook §6.4).
 * Keep both in sync; Phase 4 unit tests pin both against the same table.
 */

export const FREE_SHIPPING_THRESHOLD = 1499;
export const SHIPPING_FEE = 99;

export type CartLine = { price: number; quantity: number };

export function cartTotals(lines: CartLine[]) {
  const subtotal = lines.reduce((acc, l) => acc + l.price * l.quantity, 0);
  const unlocked = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = unlocked ? 0 : SHIPPING_FEE;
  return {
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    freeShippingUnlocked: unlocked,
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}
