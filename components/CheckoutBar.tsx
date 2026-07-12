"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useCartStore, cartTotal, cartCount } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import { formatUzs } from "@/lib/constants";

export function CheckoutBar() {
  const t = useTranslations("cart");
  const router = useRouter();
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const { user } = useAuthStore();

  const count = cartCount(items);
  const total = cartTotal(items);

  // Savat bo'sh yoki checkout/auth sahifalarida ko'rsatmaymiz
  if (count === 0 || pathname.startsWith("/checkout") || pathname.startsWith("/auth")) {
    return null;
  }

  const goCheckout = () =>
    router.push(user ? "/checkout" : "/auth?next=/checkout");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 pointer-events-none">
      <button
        onClick={goCheckout}
        className="pointer-events-auto w-full max-w-md mx-auto h-14 bg-rose text-white rounded-full shadow-lg shadow-rose/30 flex items-center justify-between px-5 hover:bg-rose-dark active:scale-[0.98] transition-all animate-fade-in"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="relative">
            <ShoppingBag size={19} />
            <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-white text-rose text-[10px] font-bold flex items-center justify-center">
              {count}
            </span>
          </span>
          {t("checkout")}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          {formatUzs(total)}
          <ArrowRight size={16} />
        </span>
      </button>
    </div>
  );
}