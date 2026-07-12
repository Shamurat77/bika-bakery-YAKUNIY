"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CheckCircle2, CreditCard, ShieldCheck, Store, Truck } from "lucide-react";
import { db } from "@/lib/firebase";
import { useCartStore, cartTotal } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import { BRANCHES, DELIVERY_FEE_UZS, formatUzs, type BranchId } from "@/lib/constants";
import type { CartItem, DeliveryType } from "@/lib/types";
import { Header } from "@/components/Header";

const formatCard = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length <= 2 ? d : d.slice(0, 2) + "/" + d.slice(2);
};

interface Receipt {
  items: CartItem[];
  goods: number;
  delivery: number;
  total: number;
  last4: string;
  orderId: string;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const router = useRouter();
  const { items, clear } = useCartStore();
  const { user, profile, loading } = useAuthStore();

  const [step, setStep] = useState<"form" | "code">("form");
  const [name, setName] = useState("");
  const [phone9, setPhone9] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("yetkazib_berish");
  const [branchId, setBranchId] = useState<BranchId>(BRANCHES[0].id);
  const [address, setAddress] = useState("");
  const [apt, setApt] = useState("");
  const [domofon, setDomofon] = useState("");
  const [entrance, setEntrance] = useState("");
  const [floor, setFloor] = useState("");
  const [comment, setComment] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const goodsTotal = cartTotal(items);
  const deliveryFee = deliveryType === "yetkazib_berish" ? DELIVERY_FEE_UZS : 0;
  const total = goodsTotal + deliveryFee;

  const cardDigits = card.replace(/\D/g, "");
  const expDigits = expiry.replace(/\D/g, "");
  const expiryValid =
    expDigits.length === 4 && +expDigits.slice(0, 2) >= 1 && +expDigits.slice(0, 2) <= 12;

  const formValid =
    name.trim() &&
    phone9.length === 9 &&
    cardDigits.length === 16 &&
    expiryValid &&
    (deliveryType === "kelib_olish" || address.trim());

  useEffect(() => {
    if (!loading && !user) router.replace("/auth?next=/checkout");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      setName((v) => v || profile.name);
      setPhone9((v) => v || profile.phone.replace(/\D/g, "").replace(/^998/, "").slice(0, 9));
    }
  }, [profile]);

  const confirmOrder = async () => {
    if (!user || items.length === 0 || code.replace(/\D/g, "").length !== 6) return;
    setBusy(true);
    try {
      const fullAddress =
        deliveryType === "yetkazib_berish"
          ? [
              address.trim(),
              apt && `kv/ofis: ${apt}`,
              domofon && `domofon: ${domofon}`,
              entrance && `podyezd: ${entrance}`,
              floor && `qavat: ${floor}`,
            ]
              .filter(Boolean)
              .join(", ")
          : "";

      const last4 = cardDigits.slice(-4);
      const ref = await addDoc(collection(db, "orders"), {
        customerId: user.uid,
        customerName: name.trim(),
        customerPhone: "+998" + phone9,
        branchId,
        deliveryType,
        address: fullAddress,
        courierComment: comment.trim(),
        paymentMethod: "karta",
        paymentStatus: "tolandi",
        cardLast4: last4, // DIQQAT: to'liq karta raqami HECH QACHON saqlanmaydi
        status: "yangi",
        items: items.map((i) => ({
          productId: i.productId ?? null,
          name: i.name,
          qty: i.qty,
          unitPriceUzs: i.unitPrice,
          customConfig: i.customConfig ?? null,
        })),
        goodsUzs: goodsTotal,
        deliveryFeeUzs: deliveryFee,
        totalUzs: total,
        rating: null,
        ratingComment: "",
        createdAt: serverTimestamp(),
      });
      setReceipt({ items: [...items], goods: goodsTotal, delivery: deliveryFee, total, last4, orderId: ref.id });
      clear();
    } catch (e) {
      console.error("Buyurtma xatosi:", e);
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-2xl border border-blush-200 bg-white focus:outline-none focus:border-rose transition-colors text-sm";
  const cardCls = "bg-white rounded-3xl border border-blush-200/60 p-5 sm:p-6";
  const toggleCls = (active: boolean) =>
    `flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-medium text-sm transition-colors ${
      active ? "border-rose bg-blush-50 text-rose-dark" : "border-blush-200 text-espresso/60 hover:border-blush-300"
    }`;

  // ==== CHEK EKRANI ====
  if (receipt) {
    return (
      <>
        <Header />
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-10">
          <div className={`${cardCls} max-w-md w-full`}>
            <div className="text-center mb-6">
              <CheckCircle2 size={48} className="mx-auto text-rose mb-3" />
              <h1 className="font-fraunces text-espresso text-2xl">{t("success")}</h1>
              <p className="text-espresso/60 text-sm mt-1">{t("successText")}</p>
            </div>

            <div className="rounded-2xl border border-dashed border-blush-300 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-espresso/60">
                <span>{t("orderNo")}</span>
                <span className="font-mono text-espresso">{receipt.orderId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-espresso/60">
                <span>{t("date")}</span>
                <span className="text-espresso">{new Date().toLocaleString("uz-UZ")}</span>
              </div>
              <div className="border-t border-blush-200/60 my-2" />
              {receipt.items.map((i) => (
                <div key={i.key} className="flex justify-between gap-3">
                  <span className="text-espresso/70">{i.name} × {i.qty}</span>
                  <span className="text-espresso whitespace-nowrap">{formatUzs(i.unitPrice * i.qty)}</span>
                </div>
              ))}
              <div className="border-t border-blush-200/60 my-2" />
              <div className="flex justify-between text-espresso/60">
                <span>{t("deliveryFee")}</span>
                <span>{receipt.delivery === 0 ? t("free") : formatUzs(receipt.delivery)}</span>
              </div>
              <div className="flex justify-between text-espresso/60">
                <span>{t("paidWith")}</span>
                <span className="text-espresso">•••• {receipt.last4}</span>
              </div>
              <div className="flex justify-between font-medium text-espresso text-base pt-1">
                <span>{t("total")}</span>
                <span>{formatUzs(receipt.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Link
                href="/orders"
                className="text-center bg-rose text-white py-3 rounded-full font-medium text-sm hover:bg-rose-dark transition-colors"
              >
                {t("myOrders")}
              </Link>
              <button
                onClick={() => router.push("/")}
                className="border-2 border-blush-200 text-espresso py-3 rounded-full font-medium text-sm hover:border-rose transition-colors"
              >
                {t("backHome")}
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ==== KOD BOSQICHI ====
  if (step === "code") {
    return (
      <>
        <Header />
        <main className="min-h-[70vh] flex items-center justify-center px-4">
          <div className={`${cardCls} max-w-sm w-full text-center`}>
            <ShieldCheck size={44} className="mx-auto text-rose mb-4" />
            <h1 className="font-fraunces text-espresso text-2xl mb-2">{t("codeTitle")}</h1>
            <p className="text-espresso/60 text-sm mb-1">{t("codeText")}</p>
            <p className="text-espresso/40 text-xs mb-6">
              •••• {cardDigits.slice(-4)} · {formatUzs(total)}
            </p>

            <input
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-3 rounded-2xl border border-blush-200 focus:outline-none focus:border-rose mb-2"
            />
            <p className="text-[11px] text-espresso/40 mb-5">{t("codeDemo")}</p>

            <button
              onClick={confirmOrder}
              disabled={busy || code.length !== 6}
              className="w-full bg-rose text-white py-3.5 rounded-full font-medium hover:bg-rose-dark transition-colors disabled:opacity-40 mb-3"
            >
              {busy ? "..." : t("confirm")}
            </button>
            <button onClick={() => setStep("form")} className="text-sm text-espresso/50 hover:text-rose">
              {t("back")}
            </button>
          </div>
        </main>
      </>
    );
  }

  // ==== ASOSIY FORMA ====
  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <h1 className="font-fraunces text-espresso text-3xl sm:text-4xl mb-8">{t("title")}</h1>

        {items.length === 0 ? (
          <p className="text-espresso/50">{t("emptyCart")}</p>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
            <div className="space-y-6">
              <section className={cardCls}>
                <h2 className="font-fraunces text-espresso text-xl mb-4">{t("deliveryConditions")}</h2>
                <div className="flex gap-3 mb-4">
                  <button onClick={() => setDeliveryType("yetkazib_berish")} className={toggleCls(deliveryType === "yetkazib_berish")}>
                    <Truck size={17} /> {t("delivery")}
                    <span className="text-xs opacity-70">{formatUzs(DELIVERY_FEE_UZS)}</span>
                  </button>
                  <button onClick={() => setDeliveryType("kelib_olish")} className={toggleCls(deliveryType === "kelib_olish")}>
                    <Store size={17} /> {t("pickup")}
                    <span className="text-xs opacity-70">{t("free")}</span>
                  </button>
                </div>

                {deliveryType === "yetkazib_berish" ? (
                  <div className="space-y-3">
                    <input placeholder={t("address")} value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <input placeholder={t("apt")} value={apt} onChange={(e) => setApt(e.target.value)} className={inputCls} />
                      <input placeholder={t("domofon")} value={domofon} onChange={(e) => setDomofon(e.target.value)} className={inputCls} />
                      <input placeholder={t("entrance")} value={entrance} onChange={(e) => setEntrance(e.target.value)} className={inputCls} />
                      <input placeholder={t("floor")} value={floor} onChange={(e) => setFloor(e.target.value)} className={inputCls} />
                    </div>
                    <input placeholder={t("courierComment")} value={comment} onChange={(e) => setComment(e.target.value)} className={inputCls} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-espresso mb-2">{t("branch")}</p>
                    {BRANCHES.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBranchId(b.id)}
                        className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition-colors ${
                          branchId === b.id ? "border-rose bg-blush-50" : "border-blush-200 hover:border-blush-300"
                        }`}
                      >
                        <span className="font-medium text-espresso text-sm">{b.name}</span>
                        <span className="block text-xs text-espresso/50 mt-0.5">{b.address}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className={cardCls}>
                <h2 className="font-fraunces text-espresso text-xl mb-4">{t("contact")}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input placeholder={t("name")} value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                  <div className="flex items-center rounded-2xl border border-blush-200 bg-white focus-within:border-rose transition-colors">
                    <span className="pl-4 text-sm text-espresso/70 select-none">+998</span>
                    <input
                      inputMode="numeric"
                      placeholder="90 123 45 67"
                      value={phone9}
                      onChange={(e) => setPhone9(e.target.value.replace(/\D/g, "").slice(0, 9))}
                      className="flex-1 py-3 px-2 bg-transparent focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </section>

              <section className={cardCls}>
                <h2 className="font-fraunces text-espresso text-xl mb-4 flex items-center gap-2">
                  <CreditCard size={19} className="text-rose" /> {t("payment")}
                </h2>
                <div className="grid grid-cols-[1fr_110px] gap-3">
                  <input
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={card}
                    onChange={(e) => setCard(formatCard(e.target.value))}
                    className={`${inputCls} font-mono tracking-wider`}
                  />
                  <input
                    inputMode="numeric"
                    placeholder={t("expiry")}
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className={`${inputCls} font-mono text-center`}
                  />
                </div>
                <p className="text-xs text-espresso/50 mt-3 flex items-center gap-1.5">
                  <ShieldCheck size={13} /> {t("cardNote")}
                </p>
              </section>
            </div>

            <aside className={`${cardCls} lg:sticky lg:top-20`}>
              <h2 className="font-fraunces text-espresso text-xl mb-4">{t("summary")}</h2>
              <div className="space-y-2.5 mb-4">
                {items.map((i) => (
                  <div key={i.key} className="flex justify-between text-sm gap-3">
                    <span className="text-espresso/70">{i.name} <span className="text-espresso/40">× {i.qty}</span></span>
                    <span className="text-espresso whitespace-nowrap">{formatUzs(i.unitPrice * i.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-blush-200/60 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-espresso/60">{t("goods")}</span>
                  <span className="text-espresso">{formatUzs(goodsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-espresso/60">{t("deliveryFee")}</span>
                  <span className={deliveryFee === 0 ? "text-rose" : "text-espresso"}>
                    {deliveryFee === 0 ? t("free") : formatUzs(deliveryFee)}
                  </span>
                </div>
              </div>
              <div className="border-t border-blush-200/60 mt-4 pt-4 flex justify-between items-baseline mb-5">
                <span className="text-espresso/60">{t("total")}</span>
                <span className="font-fraunces text-espresso text-2xl">{formatUzs(total)}</span>
              </div>
              <button
                onClick={() => setStep("code")}
                disabled={!formValid}
                className="w-full bg-rose text-white py-3.5 rounded-full font-medium hover:bg-rose-dark transition-colors disabled:opacity-40"
              >
                {t("pay")}
              </button>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}