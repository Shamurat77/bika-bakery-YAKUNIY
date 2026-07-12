"use client";

import {
  Boxes,
  Users,
  CakeSlice,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { useAuthStore } from "@/lib/authStore";
import { logoutUser } from "@/lib/authActions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Buyurtmalar", icon: ClipboardList },
  { href: "/admin/menu", label: "Menyu", icon: CakeSlice },
  { href: "/admin/inventory", label: "Ombor", icon: Boxes },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile } = useAuthStore();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[240px_1fr]">
        {/* Yon menyu (desktop) / yuqori panel (mobil) */}
        <aside className="bg-espresso text-white lg:min-h-screen lg:sticky lg:top-0 lg:h-screen flex lg:flex-col overflow-x-auto">
          <div className="hidden lg:flex items-center gap-1.5 px-6 h-16 border-b border-white/10 shrink-0">
            <span className="font-fraunces text-xl">Bika</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-rose-light">
              Admin
            </span>
          </div>

          <nav className="flex lg:flex-col gap-1 p-2 lg:p-3 flex-1 items-center lg:items-stretch">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
                  isActive(href)
                    ? "bg-rose text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            ))}

            <div className="lg:mt-auto flex lg:flex-col gap-1 lg:border-t lg:border-white/10 lg:pt-3">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 whitespace-nowrap transition-colors"
              >
                <Home size={17} />
                <span>Saytga qaytish</span>
              </Link>
              <button
                onClick={() => logoutUser()}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-rose-light hover:text-white hover:bg-white/5 whitespace-nowrap transition-colors"
              >
                <LogOut size={17} />
                <span>Chiqish</span>
              </button>
            </div>
          </nav>

          <div className="hidden lg:block px-6 py-4 border-t border-white/10 text-xs text-white/40">
            {profile?.name} · Admin
          </div>
        </aside>

        <main className="p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </AdminGuard>
  );
}
