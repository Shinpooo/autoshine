export type PackKey = "Pack Confort" | "Pack Premium" | "Pack Detailing";
export type VehicleCategoryKey = "compact" | "standard" | "xl" | "utility";

export type PackConfig = {
  durationMinutes: number;
  prices: Record<VehicleCategoryKey, number>;
};

export const PACK_CONFIG: Record<PackKey, PackConfig> = {
  "Pack Confort": {
    durationMinutes: 150,
    prices: {
      compact: 11000,
      standard: 12000,
      xl: 14000,
      utility: 15000,
    },
  },
  "Pack Premium": {
    durationMinutes: 240,
    prices: {
      compact: 16500,
      standard: 18000,
      xl: 22000,
      utility: 21500,
    },
  },
  "Pack Detailing": {
    durationMinutes: 360,
    prices: {
      compact: 29900,
      standard: 30900,
      xl: 34000,
      utility: 35000,
    },
  },
};

export const BOOKABLE_PACKS: string[] = Object.keys(PACK_CONFIG);

export const VEHICLE_CATEGORIES: Array<{
  key: VehicleCategoryKey;
  label: string;
  examples: string;
}> = [
  {
    key: "compact",
    label: "Compact",
    examples: "Mini et citadine",
  },
  {
    key: "standard",
    label: "Standard",
    examples: "Berline, break, SUV compact, coupé ou cabine utilitaire",
  },
  {
    key: "xl",
    label: "XL / 7 places",
    examples: "Grand SUV, monospace ou grande familiale",
  },
  {
    key: "utility",
    label: "Utilitaire avec chargement",
    examples: "Moyen ou grand utilitaire",
  },
];

export function isBookablePack(pack: string): pack is PackKey {
  return Object.prototype.hasOwnProperty.call(PACK_CONFIG, pack);
}

export function isVehicleCategoryKey(
  category: string,
): category is VehicleCategoryKey {
  return VEHICLE_CATEGORIES.some((item) => item.key === category);
}

export function getPackConfig(pack: string): PackConfig {
  if (!isBookablePack(pack)) {
    return PACK_CONFIG["Pack Confort"];
  }
  return PACK_CONFIG[pack];
}

export function getPackPriceCents(
  pack: string,
  category: string,
): number | null {
  if (!isBookablePack(pack) || !isVehicleCategoryKey(category)) {
    return null;
  }
  return PACK_CONFIG[pack].prices[category];
}

export function getStartingPriceCents(pack: string): number | null {
  if (!isBookablePack(pack)) return null;
  return Math.min(...Object.values(PACK_CONFIG[pack].prices));
}

export function getVehicleCategoryLabel(category: string): string {
  return (
    VEHICLE_CATEGORIES.find((item) => item.key === category)?.label ||
    "Gabarit non précisé"
  );
}

export function computeDepositCents(totalPriceCents: number): number {
  return Math.round(totalPriceCents * 0.2);
}

export function centsToEuros(cents: number): string {
  return (cents / 100).toFixed(2);
}
