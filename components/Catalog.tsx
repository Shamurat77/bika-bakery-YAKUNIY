"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useProducts } from "@/lib/useProducts";
import { ProductCard } from "./ProductCard";

// Bazada category_ru bo'lmasa ishlatiiladigan zaxira tarjimalar
const CATEGORY_RU_FALLBACK: Record<string, string> = {
  Tortlar: "Торты",
  Kapkeyklar: "Капкейки",
  Desertlar: "Десерты",
  "Brauni & Pechenye": "Брауни и печенье",
  "Sovg'a to'plamlari": "Подарочные наборы",
};

export function Catalog() {
  const t = useTranslations("catalog");
  const locale = useLocale();
  const { products, loading } = useProducts();
  const [category, setCategory] = useState<string>("all");

  // Kategoriyalar: kaliti — o'zbekcha nom, yorlig'i — joriy til
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (!map.has(p.category)) {
        map.set(
          p.category,
          locale === "ru"
            ? p.category_ru || CATEGORY_RU_FALLBACK[p.category] || p.category
            : p.category
        );
      }
    }
    return [...map.entries()]; // [key, label][]
  }, [products, locale]);

  const filtered =
    category === "all"
      ? products
      : products.filter((p) => p.category === category);

  return (
    <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <p className="font-jost text-rose text-sm tracking-[0.2em] uppercase mb-2">
          {t("eyebrow")}
        </p>
        <h2 className="font-fraunces font-medium text-espresso text-3xl sm:text-4xl">
          {t("title")}
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => setCategory("all")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            category === "all"
              ? "bg-rose text-white"
              : "bg-white border border-blush-200 text-espresso/70 hover:border-rose"
          }`}
        >
          {t("all")}
        </button>
        {categories.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              category === key
                ? "bg-rose text-white"
                : "bg-white border border-blush-200 text-espresso/70 hover:border-rose"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl bg-blush-50 animate-pulse aspect-4/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-espresso/50 py-12">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
