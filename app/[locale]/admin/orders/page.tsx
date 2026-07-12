"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  Cake,
  CreditCard,
  FileSpreadsheet,
  MapPin,
  MessageSquareText,
  Phone,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { BRANCHES, formatUzs } from "@/lib/constants";
import { exportToExcel } from "@/lib/excel";
import type { Order, OrderStatus } from "@/lib/types";

const FLOW: OrderStatus[] = ["yangi", "tayyorlanmoqda", "yolda", "yetkazildi"];

const STATUS_LABEL: Record<OrderStatus, string> = {
  yangi: "Yangi",
  tayyorlanmoqda: "Tayyorlanmoqda",
  yolda: "Yo'lda",
  yetkazildi: "Yetkazildi",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  yangi: "bg-blue-50 text-blue-600 border-blue-200",
  tayyorlanmoqda: "bg-amber-50 text-amber-600 border-amber-200",
  yolda: "bg-purple-50 text-purple-600 border-purple-200",
  yetkazildi: "bg-green-50 text-green-600 border-green-200",
};

const branchName = (id: string) =>
  BRANCHES.find((b) => b.id === id)?.name ?? id;

const fmtDate = (o: Order) => {
  const ms = o.createdAt?.toMillis?.();
  return ms ? new Date(ms).toLocaleString("uz-UZ") : "—";
};

function CakeDetails({ item }: { item: Order["items"][number] }) {
  const c = item.customConfig;
  if (!c) return null;
  const parts = [
    `${c.tiers} qavat`,
    `${c.weightKg} kg`,
    c.color,
    c.flavor.replace("_", " "),
    c.inscription && `yozuv: "${c.inscription}"`,
    c.neededBy && `sana: ${c.neededBy}`,
    c.notes && `izoh: ${c.notes}`,
  ].filter(Boolean);
  return (
    <span className="flex items-start gap-1.5 text-xs text-rose-dark bg-blush-50 rounded-lg px-2 py-1 mt-1">
      <Cake size={12} className="mt-0.5 shrink-0" />
      {parts.join(" · ")}
    </span>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    const q = query(collection(db, "orders"));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
      list.sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );
      setOrders(list);
    });
  }, []);

  const filtered = useMemo(
    () => (statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of FLOW) c[s] = orders.filter((o) => o.status === s).length;
    return c;
  }, [orders]);

  const setStatus = (id: string, status: OrderStatus) =>
    updateDoc(doc(db, "orders", id), { status });

  const doExport = () =>
    exportToExcel(
      filtered.map((o) => ({
        Raqam: o.id.slice(0, 8).toUpperCase(),
        Sana: fmtDate(o),
        Mijoz: o.customerName,
        Telefon: o.customerPhone,
        Turi: o.deliveryType === "yetkazib_berish" ? "Yetkazib berish" : "Olib ketish",
        "Filial/Manzil": o.deliveryType === "kelib_olish" ? branchName(o.branchId) : o.address,
        Mahsulotlar: o.items.map((i) => `${i.name} x${i.qty}`).join("; "),
        "Mahsulotlar (so'm)": o.goodsUzs ?? o.totalUzs,
        "Yetkazish (so'm)": o.deliveryFeeUzs ?? 0,
        "Jami (so'm)": o.totalUzs,
        "To'lov": o.cardLast4 ? `Karta •••• ${o.cardLast4}` : "Karta",
        Holat: STATUS_LABEL[o.status],
        Baho: o.rating ?? "",
        Izoh: o.ratingComment ?? "",
      })),
      "Buyurtmalar",
      `bika-buyurtmalar-${new Date().toISOString().slice(0, 10)}.xlsx`
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-fraunces text-espresso text-2xl sm:text-3xl">Buyurtmalar</h1>
        <button
          onClick={doExport}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
        >
          <FileSpreadsheet size={16} /> Excel export
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", ...FLOW] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s as OrderStatus | "all")}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === s
                ? "bg-rose text-white border-rose"
                : "bg-white text-espresso/60 border-blush-200 hover:border-rose"
            }`}
          >
            {s === "all" ? "Hammasi" : STATUS_LABEL[s as OrderStatus]}
            <span className="ml-1.5 opacity-60">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-espresso/50 py-8 text-center">Buyurtmalar yo'q</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-blush-200/60 p-4 sm:p-5">
              {/* Yuqori qator */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                <span className="font-mono text-xs text-espresso/50">
                  #{o.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-xs text-espresso/40">{fmtDate(o)}</span>
                <span
                  className={`text-xs font-medium border rounded-full px-2.5 py-0.5 ${STATUS_STYLE[o.status]}`}
                >
                  {STATUS_LABEL[o.status]}
                </span>
                <span className="ml-auto font-fraunces text-espresso text-lg">
                  {formatUzs(o.totalUzs)}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {/* Mijoz + manzil */}
                <div className="space-y-1.5 text-sm">
                  <p className="font-medium text-espresso">{o.customerName}</p>
                  <p className="flex items-center gap-1.5 text-espresso/60">
                    <Phone size={13} />
                    <a href={`tel:${o.customerPhone}`} className="hover:text-rose">
                      {o.customerPhone}
                    </a>
                  </p>
                  <p className="flex items-start gap-1.5 text-espresso/60">
                    {o.deliveryType === "yetkazib_berish" ? (
                      <>
                        <Truck size={13} className="mt-0.5 shrink-0" />
                        <span>{o.address || "Manzil ko'rsatilmagan"}</span>
                      </>
                    ) : (
                      <>
                        <Store size={13} className="mt-0.5 shrink-0" />
                        <span>Olib ketish · {branchName(o.branchId)}</span>
                      </>
                    )}
                  </p>
                  {o.courierComment && (
                    <p className="flex items-start gap-1.5 text-espresso/50 text-xs">
                      <MapPin size={12} className="mt-0.5 shrink-0" />
                      {o.courierComment}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-espresso/50 text-xs">
                    <CreditCard size={12} />
                    Karta {o.cardLast4 ? `•••• ${o.cardLast4}` : ""} · to'landi
                  </p>
                </div>

                {/* Mahsulotlar */}
                <div className="text-sm space-y-1">
                  {o.items.map((i, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between gap-3">
                        <span className="text-espresso/70">
                          {i.name} <span className="text-espresso/40">× {i.qty}</span>
                        </span>
                        <span className="text-espresso whitespace-nowrap">
                          {formatUzs(i.unitPriceUzs * i.qty)}
                        </span>
                      </div>
                      <CakeDetails item={i} />
                    </div>
                  ))}
                  {(o.deliveryFeeUzs ?? 0) > 0 && (
                    <div className="flex justify-between gap-3 text-espresso/50 text-xs pt-1">
                      <span>Yetkazib berish</span>
                      <span>{formatUzs(o.deliveryFeeUzs)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mijoz bahosi (faqat admin ko'radi) */}
              {o.rating && (
                <div className="mt-3 flex items-start gap-2 bg-gold/10 border border-gold/30 rounded-xl px-3 py-2 text-sm">
                  <span className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        className={n <= (o.rating ?? 0) ? "text-gold fill-gold" : "text-blush-200"}
                      />
                    ))}
                  </span>
                  {o.ratingComment && (
                    <span className="flex items-start gap-1.5 text-espresso/70">
                      <MessageSquareText size={13} className="mt-0.5 shrink-0" />
                      {o.ratingComment}
                    </span>
                  )}
                </div>
              )}

              {/* Holat boshqaruvi */}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-blush-200/60 pt-3">
                {FLOW.map((s, i) => {
                  const current = FLOW.indexOf(o.status);
                  return (
                    <button
                      key={s}
                      onClick={() => setStatus(o.id, s)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        o.status === s
                          ? "bg-rose text-white border-rose"
                          : i <= current
                            ? "bg-blush-50 text-rose-dark border-blush-200"
                            : "bg-white text-espresso/50 border-blush-200 hover:border-rose"
                      }`}
                    >
                      {i + 1}. {STATUS_LABEL[s]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
