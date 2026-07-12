"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCartStore, cartTotal } from "@/lib/cartStore";
import { useUiStore } from "@/lib/uiStore";
import { useAuthStore } from "@/lib/authStore";
import { formatUzs } from "@/lib/constants";

export function CartDrawer() {
  const t = useTranslations("cart");
  const router = useRouter();
  const { items, increment, decrement, remove } = useCartStore();
  const { cartOpen, closeCart } = useUiStore();
  const { user } = useAuthStore();
  const total = cartTotal(items);

  const checkout = () => {
    closeCart();
    router.push(user ? "/checkout" : "/auth?next=/checkout");
  };

  return (
    <>
      {cartOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-cream shadow-2xl transition-transform duration-300 flex flex-col ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-blush-200/60">
          <h2 className="font-fraunces text-espresso text-xl">{t("title")}</h2>
          <button
            onClick={closeCart}
            aria-label="Yopish"
            className="p-2 rounded-full hover:bg-blush-100 transition-colors"
          >
            <X size={20} className="text-espresso" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-espresso/40 gap-3">
              <ShoppingBag size={40} />
              <p>{t("empty")}</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.key}
                className="flex gap-4 bg-white rounded-2xl border border-blush-200/60 p-3"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-blush-100 flex items-center justify-center text-2xl shrink-0">
                    🎂
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-espresso text-sm truncate">{item.name}</p>
                  <p className="text-rose-dark text-sm mt-0.5">
                    {formatUzs(item.unitPrice)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => decrement(item.key)}
                      className="w-7 h-7 rounded-full border border-blush-200 flex items-center justify-center hover:border-rose transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => increment(item.key)}
                      className="w-7 h-7 rounded-full border border-blush-200 flex items-center justify-center hover:border-rose transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={() => remove(item.key)}
                      aria-label="O'chirish"
                      className="ml-auto p-1.5 text-espresso/40 hover:text-rose transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-blush-200/60 px-6 py-5 space-y-4 bg-white">
            <div className="flex justify-between font-jost">
              <span className="text-espresso/60">{t("total")}</span>
              <span className="font-medium text-espresso text-lg">{formatUzs(total)}</span>
            </div>
            <button
              onClick={checkout}
              className="w-full bg-rose text-white py-3.5 rounded-full font-medium hover:bg-rose-dark transition-colors"
            >
              {t("checkout")}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}