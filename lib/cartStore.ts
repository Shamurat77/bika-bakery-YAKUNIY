import { create } from "zustand";
import type { CartItem, CustomCakeConfig, Product } from "./types";
import { cakePrice } from "./pricing";

interface CartState {
  items: CartItem[];
  addProduct: (p: Product) => void;
  addCustomCake: (config: CustomCakeConfig) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addProduct: (p) =>
    set((s) => {
      const key = `p-${p.id}`;
      const existing = s.items.find((i) => i.key === key);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.key === key ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return {
        items: [
          ...s.items,
          {
            key,
            productId: p.id,
            name: p.name,
            unitPrice: p.priceUzs,
            qty: 1,
            imageUrl: p.imageUrl,
            weightLabel: p.weightLabel,
          },
        ],
      };
    }),

  addCustomCake: (config) =>
    set((s) => ({
      items: [
        ...s.items,
        {
          key: `c-${Date.now()}`,
          name: `Maxsus tort — ${config.tiers} qavat, ${config.weightKg} kg`,
          unitPrice: cakePrice(config),
          qty: 1,
          customConfig: config,
        },
      ],
    })),

  increment: (key) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.key === key ? { ...i, qty: i.qty + 1 } : i
      ),
    })),

  decrement: (key) =>
    set((s) => ({
      items: s.items
        .map((i) => (i.key === key ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    })),

  remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
  clear: () => set({ items: [] }),
}));

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

export const cartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.qty, 0);