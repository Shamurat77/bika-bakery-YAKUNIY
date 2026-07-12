"use client";

// ============================================================
// DEMO REJIMI: himoya vaqtincha o'chirilgan — hamma kirishi mumkin.
// Real ishga tushirishdan oldin quyidagi qatorni o'chirib,
// pastdagi izohga olingan asl kodni qaytaring.
// ============================================================
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/* === ASL HIMOYA (launch'dan oldin qaytariladi) ===
import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/authStore";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/auth?next=/admin");
    else if (profile && profile.role !== "admin") router.replace("/");
  }, [user, profile, loading, router]);

  if (loading || !user || !profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex items-center gap-3 text-espresso/50">
          <span className="w-5 h-5 rounded-full border-2 border-rose border-t-transparent animate-spin" />
          Tekshirilmoqda...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
*/
