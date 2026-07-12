"use client";

import { ShoppingBag, User, LogOut, ClipboardList, Shield, Store, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useCartStore, cartCount } from "@/lib/cartStore";
import { useUiStore } from "@/lib/uiStore";
import { useAuthStore } from "@/lib/authStore";
import { logoutUser } from "@/lib/authActions";

export function Header() {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const openCart = useUiStore((s) => s.openCart);
  const { user, profile } = useAuthStore();
  const count = cartCount(items);

  const switchLocale = (l: "uz" | "ru") =>
    router.replace(pathname, { locale: l });

  return (
    <header className="sticky top-0 z-40 bg-cream/80 backdrop-blur-md border-b border-blush-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-fraunces text-2xl text-espresso">Bika</span>
          <span className="font-jost text-[11px] tracking-[0.3em] uppercase text-rose">
            Bakery
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-8 font-jost text-sm text-espresso/70">
          <a href="#katalog" className="hover:text-rose transition-colors">
            {t("catalog")}
          </a>
          <a href="#maxsus-tort" className="hover:text-rose transition-colors">
            {t("customCake")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex rounded-full border border-blush-200 overflow-hidden text-xs font-medium">
            {(["uz", "ru"] as const).map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={`px-3 py-1.5 uppercase transition-colors ${
                  locale === l
                    ? "bg-rose text-white"
                    : "text-espresso/60 hover:bg-blush-50"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Rol almashtirgich — DEMO: hammaga ko'rinadi */}
          <div className="hidden sm:flex rounded-full border border-espresso/15 bg-espresso overflow-hidden text-xs font-medium">
              <Link
                href="/"
                className={`flex items-center gap-1.5 px-3.5 py-2 transition-colors ${
                  !pathname.startsWith("/filial") && !pathname.startsWith("/admin")
                    ? "bg-rose text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Users size={13} /> Foydalanuvchi
              </Link>
              <Link
                href="/filial"
                className={`flex items-center gap-1.5 px-3.5 py-2 transition-colors ${
                  pathname.startsWith("/filial")
                    ? "bg-rose text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Store size={13} /> Filial
              </Link>
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-rose text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Shield size={13} /> Admin
              </Link>
          </div>

          {user ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-espresso/70 px-2">
                <User size={15} className="text-rose" />
                {profile?.name ?? user.displayName}
              </span>
              <Link
                href="/orders"
                aria-label="Buyurtmalarim"
                className="p-2.5 rounded-full bg-white border border-blush-200 hover:border-rose transition-colors"
              >
                <ClipboardList size={16} className="text-espresso/60" />
              </Link>
              <button
                onClick={() => logoutUser()}
                aria-label="Chiqish"
                className="p-2.5 rounded-full bg-white border border-blush-200 hover:border-rose transition-colors"
              >
                <LogOut size={16} className="text-espresso/60" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              aria-label="Kirish"
              className="p-2.5 rounded-full bg-white border border-blush-200 hover:border-rose transition-colors"
            >
              <User size={18} className="text-espresso" />
            </Link>
          )}

          <button
            onClick={openCart}
            aria-label={t("cart")}
            className="relative p-2.5 rounded-full bg-white border border-blush-200 hover:border-rose transition-colors"
          >
            <ShoppingBag size={18} className="text-espresso" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose text-white text-[11px] font-medium flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}