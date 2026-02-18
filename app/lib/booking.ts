export type PackKey = "Pack Essentiel" | "Pack Confort" | "Pack Premium";

export type PackConfig = {
  durationMinutes: number;
  totalPriceCents: number;
};

export const PACK_CONFIG: Record<PackKey, PackConfig> = {
  "Pack Essentiel": { durationMinutes: 90, totalPriceCents: 12000 },
  "Pack Confort": { durationMinutes: 150, totalPriceCents: 19000 },
  "Pack Premium": { durationMinutes: 240, totalPriceCents: 29000 },
};

export const BOOKABLE_PACKS: string[] = Object.keys(PACK_CONFIG);

export function isBookablePack(pack: string): pack is PackKey {
  return Object.prototype.hasOwnProperty.call(PACK_CONFIG, pack);
}

export function getPackConfig(pack: string): PackConfig {
  if (!isBookablePack(pack)) {
    return { durationMinutes: 120, totalPriceCents: 15000 };
  }
  return PACK_CONFIG[pack];
}

export function computeDepositCents(totalPriceCents: number): number {
  return Math.round(totalPriceCents * 0.2);
}

export function centsToEuros(cents: number): string {
  return (cents / 100).toFixed(2);
}
