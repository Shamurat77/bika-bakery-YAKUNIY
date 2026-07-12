"use client";

import { useMemo, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CakeColor, CakeFlavor, CustomCakeConfig } from "@/lib/types";
import { TIER_WEIGHTS, formatUzs } from "@/lib/constants";
import { cakePrice } from "@/lib/pricing";
import { useCartStore } from "@/lib/cartStore";
import { BlobAccent } from "./BlobAccent";

const COLOR_HEX: Record<CakeColor, { base: string; top: string; dot: string }> = {
  oq: { base: "#FFF1E6", top: "#FFFAF5", dot: "#F3A9C5" },
  pushti: { base: "#F3A9C5", top: "#FCE4EC", dot: "#DD6D97" },
  shokoladli: { base: "#6B4226", top: "#8B5E3C", dot: "#C89B5C" },
};

const TIER_SIZES: Record<1 | 2 | 3, number[]> = {
  1: [190],
  2: [210, 140],
  3: [230, 165, 105],
};

function CakePreview({ config }: { config: CustomCakeConfig }) {
  const t = useTranslations("cake");
  const c = COLOR_HEX[config.color];

  return (
    <div className="relative h-full min-h-85 flex flex-col items-center justify-end pb-10 overflow-hidden">
      <BlobAccent className="top-6 left-1/2 -translate-x-1/2 w-52 h-52" color={c.dot} opacity={0.15} variant={1} animate />

      {config.inscription.trim() && (
        <div className="mb-3 px-4 py-1.5 bg-white rounded-full shadow-md border border-blush-200 max-w-[90%]">
          <span className="font-fraunces italic text-rose text-sm truncate block">
            {config.inscription}
          </span>
        </div>
      )}

      <div className="relative flex flex-col-reverse items-center">
        {TIER_SIZES[config.tiers].map((w, i) => (
          <div
            key={`${config.tiers}-${i}`}
            className="relative rounded-lg shadow-lg transition-all duration-500 animate-fade-in"
            style={{
              width: w,
              height: 48,
              backgroundColor: c.base,
              border: `1px solid ${c.dot}40`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-2.5 rounded-t-lg" style={{ backgroundColor: c.top }} />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full opacity-60" style={{ backgroundColor: c.dot }} />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.dot }} />
              <span className="w-1.5 h-1.5 rounded-full opacity-60" style={{ backgroundColor: c.dot }} />
            </div>
          </div>
        ))}
      </div>

      <div className="w-64 h-3 rounded-full bg-espresso/10 -mt-1" />

      <p className="mt-5 font-jost text-espresso/50 text-sm">
        {config.tiers} {t("tierWord")} · {config.weightKg} kg
      </p>
    </div>
  );
}

export function CakeConfigurator() {
  const t = useTranslations("cake");
  const addCustomCake = useCartStore((s) => s.addCustomCake);
  const [added, setAdded] = useState(false);

  const [config, setConfig] = useState<CustomCakeConfig>({
    tiers: 1,
    color: "pushti",
    flavor: "vanilli",
    weightKg: TIER_WEIGHTS[1],
    inscription: "",
    neededBy: "",
    notes: "",
  });

  const price = useMemo(() => cakePrice(config), [config]);

  const setTiers = (n: 1 | 2 | 3) =>
    setConfig((c) => ({ ...c, tiers: n, weightKg: TIER_WEIGHTS[n] }));

  const update = <K extends keyof CustomCakeConfig>(k: K, v: CustomCakeConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }));

  const add = () => {
    addCustomCake(config);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const FLAVORS: { id: CakeFlavor; label: string }[] = [
    { id: "vanilli", label: t("flavorVanilli") },
    { id: "shokoladli", label: t("flavorShokoladli") },
    { id: "red_velvet", label: t("flavorRedVelvet") },
    { id: "limonli", label: t("flavorLimonli") },
  ];

  const COLORS: { id: CakeColor; label: string }[] = [
    { id: "oq", label: t("colorOq") },
    { id: "pushti", label: t("colorPushti") },
    { id: "shokoladli", label: t("colorShokoladli") },
  ];

  const inputCls =
    "w-full px-4 py-3 rounded-2xl border border-blush-200 bg-white focus:outline-none focus:border-rose transition-colors text-sm";
  const chipCls = (active: boolean) =>
    `px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
      active
        ? "border-rose bg-blush-50 text-rose-dark"
        : "border-blush-200 text-espresso/60 hover:border-blush-300"
    }`;

  return (
    <section id="maxsus-tort" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <p className="font-jost text-rose text-sm tracking-[0.2em] uppercase mb-2">{t("eyebrow")}</p>
        <h2 className="font-fraunces font-medium text-espresso text-3xl sm:text-4xl">{t("title")}</h2>
        <p className="text-espresso/60 mt-3 max-w-xl mx-auto">{t("subtitle")}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
        <div className="relative bg-linear-to-br from-blush-100 to-blush-200/40 rounded-3xl border border-blush-200 overflow-hidden">
          <CakePreview config={config} />
        </div>

        <div className="bg-white rounded-3xl border border-blush-200/60 p-5 sm:p-7 space-y-6">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <label className="font-medium text-espresso text-sm">{t("tiers")}</label>
              <span className="text-xs text-rose bg-blush-50 px-2.5 py-1 rounded-full">
                {t("autoWeight")}: {config.weightKg} kg
              </span>
            </div>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setTiers(n)}
                  className={`flex-1 py-3.5 rounded-2xl font-fraunces text-lg transition-all border-2 ${
                    config.tiers === n
                      ? "border-rose bg-blush-50 text-rose-dark"
                      : "border-blush-200 text-espresso/50 hover:border-blush-300"
                  }`}
                >
                  {n}
                  <span className="block font-jost text-[11px] mt-0.5 opacity-70">
                    {TIER_WEIGHTS[n]} kg
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium text-espresso text-sm mb-3 block">{t("color")}</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c.id} onClick={() => update("color", c.id)} className={chipCls(config.color === c.id)}>
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-1.5 border border-espresso/10 align-middle"
                    style={{ backgroundColor: COLOR_HEX[c.id].base }}
                  />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium text-espresso text-sm mb-3 block">{t("flavor")}</label>
            <div className="flex gap-2 flex-wrap">
              {FLAVORS.map((f) => (
                <button key={f.id} onClick={() => update("flavor", f.id)} className={chipCls(config.flavor === f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input
                placeholder={t("inscriptionPlaceholder")}
                value={config.inscription}
                maxLength={40}
                onChange={(e) => update("inscription", e.target.value)}
                className={inputCls}
              />
            </div>
            <input
              type="date"
              value={config.neededBy}
              onChange={(e) => update("neededBy", e.target.value)}
              className={inputCls}
            />
            <input
              placeholder={t("notesPlaceholder")}
              value={config.notes}
              onChange={(e) => update("notes", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="border-t border-blush-200/60 pt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-espresso/50">{t("price")}</p>
              <p className="font-fraunces text-espresso text-2xl">{formatUzs(price)}</p>
            </div>
            <button
              onClick={add}
              className={`h-12 px-6 rounded-full font-medium text-sm flex items-center gap-2 transition-all active:scale-[0.97] ${
                added ? "bg-green-600 text-white" : "bg-rose text-white hover:bg-rose-dark"
              }`}
            >
              {added ? <Check size={17} /> : <ShoppingBag size={17} />}
              {added ? t("added") : t("addToCart")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}