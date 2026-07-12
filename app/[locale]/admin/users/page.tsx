"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, query, updateDoc } from "firebase/firestore";
import { Search, Shield, Store, User as UserIcon } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/lib/authStore";
import type { Role, UserProfile } from "@/lib/types";

const ROLE_META: Record<Role, { label: string; icon: typeof UserIcon; cls: string }> = {
  mijoz: { label: "Mijoz", icon: UserIcon, cls: "bg-blush-50 text-rose-dark border-blush-200" },
  filial: { label: "Filial", icon: Store, cls: "bg-amber-50 text-amber-600 border-amber-200" },
  admin: { label: "Admin", icon: Shield, cls: "bg-espresso text-white border-espresso" },
};

export default function AdminUsers() {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => d.data() as UserProfile);
      list.sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );
      setUsers(list);
    });
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(s) || u.phone?.toLowerCase().includes(s)
    );
  }, [users, search]);

  const setRole = (u: UserProfile, role: Role) => {
    if (u.uid === me?.uid && role !== "admin") {
      alert("O'zingizni admin'likdan chiqara olmaysiz");
      return;
    }
    updateDoc(doc(db, "users", u.uid), { role });
  };

  const fmtDate = (u: UserProfile) => {
    const ms = u.createdAt?.toMillis?.();
    return ms ? new Date(ms).toLocaleDateString("uz-UZ") : "—";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-fraunces text-espresso text-2xl sm:text-3xl">
          Foydalanuvchilar
        </h1>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso/40" />
          <input
            placeholder="Ism yoki telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-full border border-blush-200 bg-white text-sm focus:outline-none focus:border-rose w-56"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-blush-200/60 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-espresso/50 text-xs uppercase tracking-wider border-b border-blush-200/60">
              <th className="px-4 py-3">Foydalanuvchi</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">Ro'yxatdan o'tgan</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3 text-right">Rolni o'zgartirish</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const meta = ROLE_META[u.role] ?? ROLE_META.mijoz;
              const Icon = meta.icon;
              return (
                <tr key={u.uid} className="border-b border-blush-100 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium text-espresso">
                      {u.name || "—"}
                    </span>
                    {u.uid === me?.uid && (
                      <span className="ml-2 text-[11px] text-espresso/40">(siz)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-espresso/60">{u.phone || "—"}</td>
                  <td className="px-4 py-3 text-espresso/50">{fmtDate(u)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-2.5 py-1 ${meta.cls}`}
                    >
                      <Icon size={12} /> {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {(Object.keys(ROLE_META) as Role[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRole(u, r)}
                          disabled={u.role === r}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            u.role === r
                              ? "bg-rose text-white border-rose cursor-default"
                              : "bg-white text-espresso/50 border-blush-200 hover:border-rose hover:text-rose"
                          }`}
                        >
                          {ROLE_META[r].label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-espresso/50">
                  Foydalanuvchi topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-espresso/40">
        &quot;Filial&quot; roli — filial xodimi: unga faqat /filial (Kanban doska) ochiladi.
        &quot;Admin&quot; — to'liq boshqaruv. Rol o'zgarishi darhol kuchga kiradi.
      </p>
    </div>
  );
}
