import type { CustomCakeConfig } from "./types";
import { CAKE_BASE_PRICE_PER_KG, TIER_MULTIPLIER } from "./constants";

const FLAVOR_EXTRA: Record<CustomCakeConfig["flavor"], number> = {
  vanilli: 0,
  limonli: 10_000,
  shokoladli: 15_000,
  red_velvet: 25_000,
};

export function cakePrice(config: CustomCakeConfig): number {
  const inscriptionExtra = config.inscription.trim() ? 20_000 : 0;
  const base =
    CAKE_BASE_PRICE_PER_KG * config.weightKg * TIER_MULTIPLIER[config.tiers] +
    FLAVOR_EXTRA[config.flavor] * config.weightKg +
    inscriptionExtra;
  return Math.round(base / 1000) * 1000;
}