"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import {
  Banknote,
  ClipboardList,
  MapPin,
  Receipt,
  ShoppingBasket,
  Star,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { db } from "@/lib/firebase";
import { BRANCHES, formatUzs } from "@/lib/constants";
import type { Order } from "@/lib/types";

type Period = "kunlik" | "haftalik" | "oylik" | "yillik" | "custom";

const PERIODS: { id: Period; label: string }[] = [
  { id: "kunlik", label: "Kunlik" },
  { id: "haftalik", label: "Haftalik" },
  { id: "oylik", label: "Oylik" },
  { id: "yillik", label: "Yillik" },
];

const toDateInput = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

function periodRange(p: Period): [string, string] {
  const now = new Date();
  const to = toDateInput(now);
  const from = new Date(now);
  if (p === "kunlik") {
    // bugun
  } else if (p === "haftalik") {
    from.setDate(from.getDate() - 6);
  } else if (p === "oylik") {
    from.setDate(from.getDate() - 29);
  } else if (p === "yillik") {
    from.setFullYear(from.getFullYear() - 1);
    from.setDate(from.getDate() + 1);
  }
  return [toDateInput(from), to];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<Period>("haftalik");
  const [branch, setBranch] = useState<string>("all");
  const [[from, to], setRange] = useState<[string, string]>(() =>
    periodRange("haftalik")
  );

  useEffect(() => {
    const q = query(collection(db, "orders"));
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
    });
  }, []);

  const pickPeriod = (p: Period) => {
    setPeriod(p);
    setRange(periodRange(p));
  };

  const setCustom = (which: "from" | "to", value: string) => {
    setPeriod("custom");
    setRange(([f, t]) => (which === "from" ? [value, t] : [f, value]));
  };

  // Sana + filial bo'yicha filtr
  const filtered = useMemo(() => {
    const fromMs = new Date(from + "T00:00:00").getTime();
    const toMs = new Date(to + "T23:59:59").getTime();
    return orders.filter((o) => {
      const ms = o.createdAt?.toMillis?.() ?? 0;
      if (ms < fromMs || ms > toMs) return false;
      if (branch !== "all" && o.branchId !== branch) return false;
      return true;
    });
  }, [orders, from, to, branch]);

  const stats = useMemo(() => {
    const count = filtered.length;
    const sum = filtered.reduce((s, o) => s + (o.totalUzs ?? 0), 0);
    const avg = count ? Math.round(sum / count) : 0;
    const itemsSold = filtered.reduce(
      (s, o) => s + o.items.reduce((x, i) => x + i.qty, 0),
      0
    );
    const rated = filtered.filter((o) => o.rating);
    const avgRating = rated.length
      ? (rated.reduce((s, o) => s + (o.rating ?? 0), 0) / rated.length).toFixed(1)
      : "—";
    return { count, sum, avg, itemsSold, avgRating };
  }, [filtered]);

  // Grafik: qisqa davr — kunlik ustunlar, uzun davr (>62 kun) — oylik
  const chartData = useMemo(() => {
    const fromD = new Date(from + "T00:00:00");
    const toD = new Date(to + "T00:00:00");
    const dayCount =
      Math.round((toD.getTime() - fromD.getTime()) / 86_400_000) + 1;
    const byMonth = dayCount > 62;

    const buckets = new Map<string, number>();
    const cursor = new Date(fromD);
    while (cursor <= toD) {
      const key = byMonth
        ? toDateInput(cursor).slice(0, 7)
        : toDateInput(cursor);
      if (!buckets.has(key)) buckets.set(key, 0);
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const o of filtered) {
      const ms = o.createdAt?.toMillis?.();
      if (!ms) continue;
      const d = toDateInput(new Date(ms));
      const key = byMonth ? d.slice(0, 7) : d;
      if (buckets.has(key))
        buckets.set(key, (buckets.get(key) ?? 0) + (o.totalUzs ?? 0));
    }
    return [...buckets.entries()].map(([day, total]) => ({
      day: byMonth ? day : day.slice(5),
      total,
    }));
  }, [filtered, from, to]);

  const inputCls =
    "px-3 py-2 rounded-xl border border-blush-200 bg-white text-sm focus:outline-none focus:border-rose";

  const CARDS = [
    { label: "Buyurtmalar", value: String(stats.count), icon: ClipboardList, accent: "border-l-blue-400" },
    { label: "Jami summa", value: formatUzs(stats.sum), icon: Banknote, accent: "border-l-green-500" },
    { label: "O'rtacha chek", value: formatUzs(stats.avg), icon: Receipt, accent: "border-l-purple-400" },
    { label: "Sotilgan mahsulotlar", value: String(stats.itemsSold), icon: ShoppingBasket, accent: "border-l-rose" },
    { label: "O'rtacha baho", value: `${stats.avgRating} ★`, icon: Star, accent: "border-l-gold" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-fraunces text-espresso text-2xl sm:text-3xl">Dashboard</h1>
        
      </div>

      {/* Davr tugmalari */}
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => pickPeriod(p.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              period === p.id
                ? "bg-rose text-white border-rose"
                : "bg-white text-espresso/60 border-blush-200 hover:border-rose"
            }`}
          >
            {p.label}
          </button>
        ))}

        <span className="mx-1 h-6 w-px bg-blush-200 hidden sm:block" />

        {/* Filial filtri */}
        {[{ id: "all", name: "Barcha filiallar" }, ...BRANCHES].map((b) => (
          <button
            key={b.id}
            onClick={() => setBranch(b.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              branch === b.id
                ? "bg-espresso text-white border-espresso"
                : "bg-white text-espresso/60 border-blush-200 hover:border-espresso"
            }`}
          >
            {b.id !== "all" && <MapPin size={13} />}
            {b.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {CARDS.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className={`bg-white rounded-2xl border border-blush-200/60 border-l-4 ${accent} p-4`}
          >
            <div className="flex items-center gap-2 text-espresso/50 text-[11px] uppercase tracking-wider mb-2">
              <Icon size={13} />
              {label}
            </div>
            <p className="font-fraunces text-espresso text-lg sm:text-xl leading-tight">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-blush-200/60 p-4 sm:p-6">
        <h2 className="font-medium text-espresso text-sm mb-4">
          Savdo dinamikasi
          {branch !== "all" && (
            <span className="text-espresso/40 font-normal">
              {" "}· {BRANCHES.find((b) => b.id === branch)?.name}
            </span>
          )}
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fbd1e6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#2A201980" }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#2A201980" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)
                }
                width={44}
              />
              <Tooltip
                formatter={(v) => [formatUzs(Number(v)), "Savdo"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #fbd1e6", fontSize: 13 }}
              />
              <Bar dataKey="total" fill="#DD6D97" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
