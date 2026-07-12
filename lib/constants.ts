export const BRANCHES = [
  {
    id: "toshkent-city",
    name: "Toshkent City Mall",
    address: "Toshkent City Mall, 3-qavat, NIKE do'koni yonida",
    phone: "+998 90 000 00 00",
  },
  {
    id: "uzbekistan-hotel",
    name: "«Uzbechka» — Uzbekistan Hotel",
    address: "Uzbekistan mehmonxonasi yonida",
    phone: "+998 90 000 00 01",
  },
  {
    id: "kofeynya",
    name: "Bika Kofeynya",
    address: "Asosiy kofexona",
    phone: "+998 90 000 00 02",
  },
  {
    id: "foodmall",
    name: "FOODMALL korner",
    address: "FOODMALL savdo markazi",
    phone: "+998 90 000 00 03",
  },
  {
    id: "doyoga",
    name: "DOYOGA Coworking",
    address: "DOYOGA kovorking markazi",
    phone: "+998 90 000 00 04",
  },
  {
    id: "pickup",
    name: "PICK-UP korner",
    address: "Olib ketish nuqtasi",
    phone: "+998 90 000 00 05",
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
