"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  collection, doc, onSnapshot, query, updateDoc, where,
} from "firebase/firestore";
import { Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/lib/authStore";
import { formatUzs } from "@/lib/constants";
import type { Order, OrderStatus } from "@/lib/types";
import { Header } from "@/components/Header";

const FLOW: OrderStatus[] = ["yangi", "tayyorlanmoqda", "yolda", "yetkazildi"];

function StatusTimeline({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders");
  const labels: Record<OrderStatus, string> = {
    yangi: t("statusYangi"),
    tayyorlanmoqda: t("statusTayyorlanmoqda"),
    yolda: t("statusYolda"),
    yetkazildi: t("statusYetkazildi"),
  };
  const current = FLOW.indexOf(status);

  return (
    <div className="grid grid-cols-4 gap-1">
      {FLOW.map((s, i) => (
        <div key={s} className="flex flex-col items-center text-center">
          <div className="flex items-center w-full">
            <div className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : i <= current ? "bg-rose" : "bg-blush-200"}`} />
            <span
              className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                i <= current ? "bg-rose" : "bg-blush-200"
              } ${i === current ? "ring-4 ring-blush-100" : ""}`}
            />
            <div className={`h-0.5 flex-1 ${i === FLOW.length - 1 ? "opacity-0" : i < current ? "bg-rose" : "bg-blush-200"}`} />
          </div>
          <span className={`text-[10px] sm:text-xs mt-1.5 leading-tight ${i <= current ? "text-espresso" : "text-espresso/40"}`}>
            {labels[s]}
          </span>
        </div>
      ))}
    </div>
  );
}

function RateBlock({ order }: { order: Order }) {
  const t = useTranslations("orders");
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  if (order.rating || sent) {
    return <p className="text-sm text-rose mt-3">{t("rateThanks")}</p>;
  }

  const submit = async () => {
    if (!stars) return;
    await updateDoc(doc(db, "orders", order.id), { rating: stars, ratingComment: text.trim() });
    setSent(true);
  };

  return (
    <div className="mt-4 border-t border-blush-200/60 pt-4">
      <p className="text-sm font-medium text-espresso mb-2">{t("rateTitle")}</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setStars(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}>
            <Star
              size={26}
              className={(hover || stars) >= n ? "text-gold fill-gold" : "text-blush-200"}
            />
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          placeholder={t("ratePlaceholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-2xl border border-blush-200 text-sm focus:outline-none focus:border-rose"
        />
        <button
          onClick={submit}
          disabled={!stars}
          className="px-5 py-2.5 rounded-full bg-rose text-white text-sm font-medium hover:bg-rose-dark disabled:opacity-40 transition-colors"
        >
          {t("rateSubmit")}
        </button>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const t = useTranslations("orders");
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth?next=/orders");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("customerId", "==", user.uid));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
      list.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      setOrders(list);
    });
  }, [user]);

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <h1 className="font-fraunces text-espresso text-3xl sm:text-4xl mb-8">{t("title")}</h1>

        {orders.length === 0 ? (
          <p className="text-espresso/50">{t("empty")}</p>
        ) : (
          <div className="space-y-5">
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-3xl border border-blush-200/60 p-5 sm:p-6">
                <div className="flex justify-between items-baseline mb-4 gap-3">
                  <span className="font-mono text-xs text-espresso/50">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="font-fraunces text-espresso">{formatUzs(o.totalUzs)}</span>
                </div>

                <StatusTimeline status={o.status} />

                <div className="mt-4 text-sm text-espresso/60 space-y-1">
                  {o.items.map((i, idx) => (
                    <p key={idx}>{i.name} × {i.qty}</p>
                  ))}
                </div>

                {o.status === "yetkazildi" && <RateBlock order={o} />}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}