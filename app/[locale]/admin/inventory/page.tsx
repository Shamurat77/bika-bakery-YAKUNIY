"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  FileSpreadsheet,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { exportToExcel } from "@/lib/excel";
import type { InventoryItem, InventoryMove } from "@/lib/types";

export default function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [moves, setMoves] = useState<InventoryMove[]>([]);

  // Yangi xomashyo formasi
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", unit: "kg", qty: "", minQty: "" });

  // Kirim/chiqim formasi
  const [moveFor, setMoveFor] = useState<InventoryItem | null>(null);
  const [moveType, setMoveType] = useState<"kirim" | "chiqim">("kirim");
  const [moveQty, setMoveQty] = useState("");
  const [moveNote, setMoveNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub1 = onSnapshot(query(collection(db, "inventory")), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InventoryItem);
      list.sort((a, b) => a.name.localeCompare(b.name));
      setItems(list);
    });
    const unsub2 = onSnapshot(query(collection(db, "inventory_moves")), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InventoryMove);
      list.sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );
      setMoves(list.slice(0, 60));
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const lowStock = useMemo(
    () => items.filter((i) => i.qty <= i.minQty),
    [items]
  );

  const addItem = async () => {
    const qty = Number(newItem.qty) || 0;
    const minQty = Number(newItem.minQty) || 0;
    if (!newItem.name.trim() || !newItem.unit.trim()) return;
    setBusy(true);
    try {
      const ref = await addDoc(collection(db, "inventory"), {
        name: newItem.name.trim(),
        unit: newItem.unit.trim(),
        qty,
        minQty,
        updatedAt: serverTimestamp(),
      });
      if (qty > 0) {
        await addDoc(collection(db, "inventory_moves"), {
          itemId: ref.id,
          itemName: newItem.name.trim(),
          unit: newItem.unit.trim(),
          type: "kirim",
          qty,
          note: "Boshlang'ich qoldiq",
          createdAt: serverTimestamp(),
        });
      }
      setNewItem({ name: "", unit: "kg", qty: "", minQty: "" });
      setAddOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const submitMove = async () => {
    const qty = Number(moveQty);
    if (!moveFor || !qty || qty <= 0) return;
    if (moveType === "chiqim" && qty > moveFor.qty) {
      alert(`Omborda faqat ${moveFor.qty} ${moveFor.unit} bor`);
      return;
    }
    setBusy(true);
    try {
      await updateDoc(doc(db, "inventory", moveFor.id), {
        qty: increment(moveType === "kirim" ? qty : -qty),
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, "inventory_moves"), {
        itemId: moveFor.id,
        itemName: moveFor.name,
        unit: moveFor.unit,
        type: moveType,
        qty,
        note: moveNote.trim(),
        createdAt: serverTimestamp(),
      });
      setMoveFor(null);
      setMoveQty("");
      setMoveNote("");
    } finally {
      setBusy(false);
    }
  };

  const removeItem = async (i: InventoryItem) => {
    if (confirm(`"${i.name}" ombordan o'chirilsinmi?`)) {
      await deleteDoc(doc(db, "inventory", i.id));
    }
  };

  const exportStock = () =>
    exportToExcel(
      items.map((i) => ({
        Xomashyo: i.name,
        Birlik: i.unit,
        Qoldiq: i.qty,
        "Min. qoldiq": i.minQty,
        Holat: i.qty <= i.minQty ? "KAM QOLDI" : "Yetarli",
      })),
      "Ombor",
      `bika-ombor-${new Date().toISOString().slice(0, 10)}.xlsx`
    );

  const fmtDate = (m: InventoryMove) => {
    const ms = m.createdAt?.toMillis?.();
    return ms ? new Date(ms).toLocaleString("uz-UZ") : "—";
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-blush-200 bg-white text-sm focus:outline-none focus:border-rose";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-fraunces text-espresso text-2xl sm:text-3xl">Ombor</h1>
        <div className="flex gap-2">
          <button
            onClick={exportStock}
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            <FileSpreadsheet size={16} /> Hisobot
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 bg-rose text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-rose-dark transition-colors"
          >
            <Plus size={16} /> Xomashyo
          </button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-700">
          <AlertTriangle size={17} className="mt-0.5 shrink-0" />
          <span>
            Kam qolgan: {lowStock.map((i) => `${i.name} (${i.qty} ${i.unit})`).join(", ")}
          </span>
        </div>
      )}

      {/* Xomashyolar jadvali */}
      <div className="bg-white rounded-2xl border border-blush-200/60 overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-espresso/50 text-xs uppercase tracking-wider border-b border-blush-200/60">
              <th className="px-4 py-3">Xomashyo</th>
              <th className="px-4 py-3">Qoldiq</th>
              <th className="px-4 py-3">Min.</th>
              <th className="px-4 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-blush-100 last:border-0">
                <td className="px-4 py-3 font-medium text-espresso">{i.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`font-medium ${
                      i.qty <= i.minQty ? "text-amber-600" : "text-espresso"
                    }`}
                  >
                    {i.qty} {i.unit}
                  </span>
                </td>
                <td className="px-4 py-3 text-espresso/50">
                  {i.minQty} {i.unit}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => { setMoveFor(i); setMoveType("kirim"); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      <ArrowDownCircle size={13} /> Kirim
                    </button>
                    <button
                      onClick={() => { setMoveFor(i); setMoveType("chiqim"); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-blush-50 text-rose-dark border border-blush-200 hover:bg-blush-100 transition-colors"
                    >
                      <ArrowUpCircle size={13} /> Chiqim
                    </button>
                    <button
                      onClick={() => removeItem(i)}
                      className="px-2.5 py-1.5 rounded-full text-espresso/40 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-espresso/50">
                  Ombor bo'sh. &quot;Xomashyo&quot; tugmasi bilan qo'shing.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Harakatlar tarixi */}
      <div className="bg-white rounded-2xl border border-blush-200/60 p-4 sm:p-5">
        <h2 className="font-medium text-espresso text-sm mb-3">
          Oxirgi harakatlar
        </h2>
        {moves.length === 0 ? (
          <p className="text-espresso/50 text-sm">Hozircha harakatlar yo'q</p>
        ) : (
          <div className="space-y-2">
            {moves.map((m) => (
              <div key={m.id} className="flex items-center gap-3 text-sm">
                {m.type === "kirim" ? (
                  <ArrowDownCircle size={15} className="text-green-500 shrink-0" />
                ) : (
                  <ArrowUpCircle size={15} className="text-rose shrink-0" />
                )}
                <span className="text-espresso/80">
                  {m.itemName} — {m.type === "kirim" ? "+" : "−"}
                  {m.qty} {m.unit}
                </span>
                {m.note && <span className="text-espresso/40 text-xs">({m.note})</span>}
                <span className="ml-auto text-espresso/40 text-xs whitespace-nowrap">
                  {fmtDate(m)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Yangi xomashyo oynasi */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setAddOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-fraunces text-espresso text-xl">Yangi xomashyo</h2>
              <button onClick={() => setAddOpen(false)} className="p-2 rounded-full hover:bg-blush-50">
                <X size={18} className="text-espresso/60" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Nomi (Un, Shakar, Krem...) *"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className={inputCls}
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  placeholder="Birlik *"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className={inputCls}
                  list="units"
                />
                <datalist id="units">
                  {["kg", "litr", "dona", "quti"].map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
                <input
                  placeholder="Qoldiq"
                  inputMode="decimal"
                  value={newItem.qty}
                  onChange={(e) => setNewItem({ ...newItem, qty: e.target.value.replace(/[^\d.]/g, "") })}
                  className={inputCls}
                />
                <input
                  placeholder="Min."
                  inputMode="decimal"
                  value={newItem.minQty}
                  onChange={(e) => setNewItem({ ...newItem, minQty: e.target.value.replace(/[^\d.]/g, "") })}
                  className={inputCls}
                />
              </div>
              <button
                onClick={addItem}
                disabled={busy}
                className="w-full bg-rose text-white py-3 rounded-full font-medium hover:bg-rose-dark disabled:opacity-50 transition-colors"
              >
                {busy ? "..." : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kirim/chiqim oynasi */}
      {moveFor && (
        <div
          className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setMoveFor(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-fraunces text-espresso text-xl">
                {moveType === "kirim" ? "Kirim" : "Chiqim"}: {moveFor.name}
              </h2>
              <button onClick={() => setMoveFor(null)} className="p-2 rounded-full hover:bg-blush-50">
                <X size={18} className="text-espresso/60" />
              </button>
            </div>
            <p className="text-sm text-espresso/50 mb-4">
              Hozirgi qoldiq: {moveFor.qty} {moveFor.unit}
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                {(["kirim", "chiqim"] as const).map((tp) => (
                  <button
                    key={tp}
                    onClick={() => setMoveType(tp)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                      moveType === tp
                        ? tp === "kirim"
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-rose bg-blush-50 text-rose-dark"
                        : "border-blush-200 text-espresso/50"
                    }`}
                  >
                    {tp === "kirim" ? "Kirim (+)" : "Chiqim (−)"}
                  </button>
                ))}
              </div>
              <input
                placeholder={`Miqdor (${moveFor.unit}) *`}
                inputMode="decimal"
                value={moveQty}
                onChange={(e) => setMoveQty(e.target.value.replace(/[^\d.]/g, ""))}
                className={inputCls}
              />
              <input
                placeholder="Izoh (yetkazuvchi, sabab...)"
                value={moveNote}
                onChange={(e) => setMoveNote(e.target.value)}
                className={inputCls}
              />
              <button
                onClick={submitMove}
                disabled={busy || !moveQty}
                className="w-full bg-rose text-white py-3 rounded-full font-medium hover:bg-rose-dark disabled:opacity-50 transition-colors"
              >
                {busy ? "..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
