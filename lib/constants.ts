export const BRANCHES = [
  {
    id: "toshkent-city",
    name: "Toshkent City Mall",
    address: "Toshkent City bog'i yonida",
    phone: "+998 90 000 00 00",
  },
  {
    id: "uzbekistan-hotel",
    name: "Uzbekistan Hotel",
    address: "Uzbekistan mehmonxonasi yonida",
    phone: "+998 90 000 00 01",
  },
] as const;

export type BranchId = (typeof BRANCHES)[number]["id"];

// Qavat soniga qarab avtomatik vazn (kg)
export const TIER_WEIGHTS: Record<1 | 2 | 3, number> = {
  1: 2,
  2: 4,
  3: 6,
};

export const CAKE_BASE_PRICE_PER_KG = 180_000; // so'm

export const TIER_MULTIPLIER: Record<1 | 2 | 3, number> = {
  1: 1,
  2: 1.15,
  3: 1.3,
};

export function formatUzs(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
}
export const DELIVERY_FEE_UZS = 15_000;