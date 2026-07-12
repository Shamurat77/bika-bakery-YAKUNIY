"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, query, updateDoc } from "firebase/firestore";
import {
  ArrowRight,
  Cake,
  History,
  MapPin,
  Package,
  Phone,
  Store,
  Truck,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { BRANCHES, formatUzs } from "@/lib/constants";
import type { Order, OrderStatus } from "@/lib/types";
import { Header } from "@/components/Header";

const FLOW: OrderStatus[] = ["yangi", "tayyorlanmoqda", "yolda", "yetkazildi"];

const STATUS_LABEL: Record<OrderStatus, string> = {
  yangi: "Yangi",
  tayyorlanmoqda: "Tayyorlanmoqda",
  yolda: "Yo'lda",
  yetkazildi: "Yetkazildi",
};

const COLUMN_STYLE: Record<OrderStatus, { dot: string; head: string }> = {
  yangi: { dot: "bg-blue-500", head: "border-t-blue-400" },
  tayyorlanmoqda: { dot: "bg-amber-500", head: "border-t-amber-400" },
  yolda: { dot: "bg-purple-500", head: "border-t-purple-400" },
  yetkazildi: { dot: "bg-green-500", head: "border-t-green-400" },
};

const NEXT_LABEL: Record<OrderStatus, string> = {
  yangi: "Tayyorlashni boshlash",
  tayyorlanmoqda: "Kuryerga berish",
  yolda: "Yetkazildi deb belgilash",
  yetkazildi: "",
};

const fmtTime = (o: Order) => {
  const ms = o.createdAt?.toMillis?.();
  return ms
    ? new Date(ms).toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
};

function OrderCard({ order }: { order: Order }) {
  const next = FLOW[FLOW.indexOf(order.status) + 1];

  const advance = () => {
    if (next) updateDoc(doc(db, "orders", order.id), { status: next });
  };

  return (
    <div className="bg-white rounded-2xl border border-blush-200/60 p-4 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-[11px] text-espresso/40">
          #{order.id.slice(0, 6).toUpperCase()}
        </span>
        <span className="text-[11px] text-espresso/40">{fmtTime(order)}</span>
      </div>

      <p className="font-medium text-espresso text-sm">{order.customerName}</p>
      <a
        href={`tel:${order.customerPhone}`}
        className="flex items-center gap-1.5 text-xs text-espresso/60 hover:text-rose mt-0.5"
      >
        <Phone size={11} /> {order.customerPhone}
      </a>

      <p className="flex items-start gap-1.5 text-xs text-espresso/50 mt-1.5">
        {order.deliveryType === "yetkazib_berish" ? (
          <>
            <Truck size={11} className="mt-0.5 shrink-0" />
            <span className="line-clamp-2">{order.address}</span>
          </>
        ) : (
          <>
            <Store size={11} className="mt-0.5 shrink-0" />
            <span>Olib ketish</span>
          </>
        )}
      </p>

      <div className="border-t border-blush-100 mt-2.5 pt-2.5 space-y-1">
        {order.items.map((i, idx) => (
          <div key={idx} className="text-xs">
            <div className="flex justify-between gap-2 text-espresso/70">
              <span className="line-clamp-1">
                {i.name} <span className="text-espresso/40">×{i.qty}</span>
              </span>
            </div>
            {i.customConfig && (
              <span className="flex items-center gap-1 text-[11px] text-rose-dark">
                <Cake size={10} />
                {i.customConfig.tiers} qavat · {i.customConfig.weightKg} kg
                {i.customConfig.inscription && ` · "${i.customConfig.inscription}"`}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <span className="font-fraunces text-espresso text-sm">
          {formatUzs(order.totalUzs)}
        </span>
      </div>

      {next && (
        <button
          onClick={advance}
          className="w-full mt-3 flex items-center justify-center gap-1.5 bg-rose text-white py-2 rounded-full text-xs font-medium hover:bg-rose-dark active:scale-[0.98] transition-all"
        >
          {NEXT_LABEL[order.status]} <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

export default function FilialPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [tab, setTab] = useState<"active" | "history">("active");

  // DEMO REJIMI: himoya vaqtincha o'chirilgan (hamma kiradi)

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

  const byBranch = useMemo(
    () =>
      branchFilter === "all"
        ? orders
        : orders.filter((o) => o.branchId === branchFilter),
    [orders, branchFilter]
  );

  const active = byBranch.filter((o) => o.status !== "yetkazildi");
  const history = byBranch.filter((o) => o.status === "yetkazildi");

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Store size={22} className="text-rose" />
              <h1 className="font-fraunces font-medium text-espresso text-2xl lg:text-3xl">
                Filial boshqaruvi
              </h1>
            </div>
            <p className="text-espresso/50 text-sm">
              Buyurtmalarni bosqichma-bosqich boshqaring — mijoz sahifasida jonli ko'rinadi
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[{ id: "all", name: "Hammasi" }, ...BRANCHES].map((b) => (
              <button
                key={b.id}
                onClick={() => setBranchFilter(b.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  branchFilter === b.id
                    ? "bg-rose text-white border-rose"
                    : "bg-white text-espresso/60 border-blush-200 hover:border-rose"
                }`}
              >
                {b.id !== "all" && <MapPin size={13} />}
                {b.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-blush-100/60 rounded-full p-1 w-fit">
          <button
            onClick={() => setTab("active")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              tab === "active"
                ? "bg-rose text-white shadow-sm"
                : "text-espresso hover:bg-blush-200/60"
            }`}
          >
            <Package size={16} />
            Faol buyurtmalar
            <span className="text-xs opacity-70">{active.length}</span>
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              tab === "history"
                ? "bg-rose text-white shadow-sm"
                : "text-espresso hover:bg-blush-200/60"
            }`}
          >
            <History size={16} />
            Tarix
            <span className="text-xs opacity-70">{history.length}</span>
          </button>
        </div>

        {tab === "active" ? (
          /* KANBAN: 3 ta faol ustun */
          <div className="grid md:grid-cols-3 gap-4 items-start">
            {(FLOW.slice(0, 3) as OrderStatus[]).map((status) => {
              const col = active.filter((o) => o.status === status);
              return (
                <div
                  key={status}
                  className={`bg-blush-50/60 rounded-2xl border border-blush-200/60 border-t-4 ${COLUMN_STYLE[status].head}`}
                >
                  <div className="flex items-center gap-2 px-4 py-3">
                    <span className={`w-2 h-2 rounded-full ${COLUMN_STYLE[status].dot}`} />
                    <span className="font-medium text-espresso text-sm">
                      {STATUS_LABEL[status]}
                    </span>
                    <span className="ml-auto text-xs text-espresso/40 bg-white rounded-full px-2 py-0.5">
                      {col.length}
                    </span>
                  </div>
                  <div className="px-3 pb-3 space-y-3 min-h-[120px]">
                    {col.length === 0 ? (
                      <p className="text-center text-espresso/30 text-xs py-8">Bo'sh</p>
                    ) : (
                      col.map((o) => <OrderCard key={o.id} order={o} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TARIX */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.length === 0 ? (
              <p className="text-espresso/50 col-span-full text-center py-10">
                Yetkazilgan buyurtmalar hali yo'q
              </p>
            ) : (
              history.map((o) => (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl border border-blush-200/60 p-4 opacity-80"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[11px] text-espresso/40">
                      #{o.id.slice(0, 6).toUpperCase()}
                    </span>
                    <span className="text-[11px] text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      Yetkazildi
                    </span>
                  </div>
                  <p className="font-medium text-espresso text-sm">{o.customerName}</p>
                  <p className="text-xs text-espresso/50 mt-1">
                    {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[11px] text-espresso/40">{fmtTime(o)}</span>
                    <span className="font-fraunces text-espresso text-sm">
                      {formatUzs(o.totalUzs)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}
