"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/lib/types";
import { formatUzs } from "@/lib/constants";
import { useCartStore } from "@/lib/cartStore";

export function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations("catalog");
  const { addProduct, increment, decrement, items } = useCartStore();

  const key = `p-${product.id}`;
  const inCart = items.find((i) => i.key === key);
  const qty = inCart?.qty ?? 0;

  const name = locale === "ru" && product.name_ru ? product.name_ru : product.name;

  return (
    <div className="group bg-white rounded-3xl border border-blush-200/60 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative aspect-4/3 overflow-hidden bg-blush-50">
        <img
          src={product.imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.weightLabel && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2.5 py-0.5 rounded-full text-[11px] font-medium text-espresso">
            {product.weightLabel}
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-fraunces text-espresso text-sm sm:text-lg leading-snug line-clamp-2">
          {name}
        </h3>

        <p className="font-jost font-medium text-rose-dark text-sm sm:text-base mt-1 mb-3">
          {formatUzs(product.priceUzs)}
        </p>

        <div className="mt-auto">
          {qty === 0 ? (
            <button
              onClick={() => addProduct(product)}
              className="w-full h-10 rounded-full bg-rose text-white flex items-center justify-center gap-2 text-sm font-medium hover:bg-rose-dark active:scale-[0.98] transition-all"
            >
              <ShoppingBag size={15} />
              {t("addToCart")}
            </button>
          ) : (
            <div className="w-full h-10 flex items-center justify-between bg-rose rounded-full px-1 animate-fade-in">
              <button
                onClick={() => decrement(key)}
                aria-label="Kamaytirish"
                className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:bg-rose-dark active:scale-90 transition-all"
              >
                <Minus size={15} />
              </button>
              <span className="text-white text-sm font-medium tabular-nums">{qty}</span>
              <button
                onClick={() => increment(key)}
                aria-label="Ko'paytirish"
                className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:bg-rose-dark active:scale-90 transition-all"
              >
                <Plus size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
