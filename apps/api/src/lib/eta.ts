/**
 * eta.ts — pincode delivery-ETA logic (§6.3, §11-A test targets).
 * Zone days from first pincode digit (India's PIN system), metro 3-digit fast lanes,
 * and a hard cap. Pure functions.
 */

import { z } from 'zod';

export const PincodeSchema = z
  .string()
  .regex(/^[1-8]\d{5}$/, 'Pincode must be 6 digits starting 1-8');

// first-digit → region base days (consumer shippable zones; 9 = Army Postal, excluded)
const ZONE_DAYS: Record<string, [number, number]> = {
  '1': [2, 4], // Delhi, Haryana, Punjab, HP, J&K
  '2': [2, 4], // UP, Uttarakhand (Agra's zone → same-state express)
  '3': [3, 5], // Rajasthan, Gujarat, MP, Chhattisgarh
  '4': [3, 5], // Maharashtra, Goa
  '5': [4, 6], // AP, Telangana, Karnataka
  '6': [4, 7], // TN, Kerala, Pondicherry
  '7': [5, 8], // WB, Odisha, NE
  '8': [6, 9], // Bihar, Jharkhand, NE
};

const METRO_FAST = new Set(['110', '400', '560', '600', '700', '302', '401', '712']);

export type Eta = {
  pincode: string;
  minDays: number;
  maxDays: number;
  metroFast: boolean;
  message: string;
  codAvailable: boolean;
};

export function etaForPincode(pincode: string): Eta | null {
  if (!PincodeSchema.safeParse(pincode).success) return null;
  const zone = ZONE_DAYS[pincode[0]];
  if (!zone) return null;
  const [minD, maxD] = zone;
  const metroFast = METRO_FAST.has(pincode.slice(0, 3));
  const min = metroFast ? Math.max(2, minD - 1) : minD;
  const max = metroFast ? Math.max(min + 1, maxD - 1) : maxD;
  // NE + far-east zones lose COD (carrier reality)
  const codAvailable = !(pincode[0] === '7' && !metroFast) && pincode[0] !== '8';
  return {
    pincode,
    minDays: min,
    maxDays: max,
    metroFast,
    codAvailable,
    message: metroFast
      ? `Metro express — delivery in ${min}-${max} days`
      : `Delivery in ${min}-${max} days`,
    } as Eta;
}
