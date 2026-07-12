"use client";

import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { processImage } from "@/lib/cloudinary";
import { formatUzs } from "@/lib/constants";
import type { Product } from "@/lib/types";

interface FormState {
  name: string;
  name_ru: string;
  category: string;
  category_ru: string;
  weightLabel: string;
  priceUzs: string;
  imageUrl: string;
}

const EMPTY: FormState = {
  name: "",
  name_ru: "",
  category: "",
  category_ru: "",
  weightLabel: "",
  priceUzs: "",
  imageUrl: "",
};

export default function AdminMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, "products"));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
      list.sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );
      setProducts(list);
    });
  }, []);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const startAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setError("");
    setOpen(true);
  };

  const startEdit = (p: Product) => {
    setForm({
      name: p.name,
      name_ru: p.name_ru ?? "",
      category: p.category,
      category_ru: p.category_ru ?? "",
      weightLabel: p.weightLabel ?? "",
      priceUzs: String(p.priceUzs),
      imageUrl: p.imageUrl ?? "",
    });
    setEditId(p.id);
    setError("");
    setOpen(true);
  };

  // Kompyuterdan rasm tanlash (Cloudinary bo'lsa bulutga, bo'lmasa siqilgan holda saqlanadi)
  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (file.size > 10 * 1024 * 1024) {
      setError("Rasm juda katta (maks. 10 MB)");
      return;
    }
    setUploading(true);
    try {
      const url = await processImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      setError("Rasm yuklashda xatolik. Qayta urinib ko'ring.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    const price = Number(form.priceUzs.replace(/\D/g, ""));
    if (!form.name.trim() || !form.category.trim() || !price) {
      setError("Nomi, kategoriya va narx majburiy");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const data = {
        name: form.name.trim(),
        name_ru: form.name_ru.trim(),
        category: form.category.trim(),
        category_ru: form.category_ru.trim(),
        description: "",
        description_ru: "",
        weightLabel: form.weightLabel.trim(),
        priceUzs: price,
        imageUrl: form.imageUrl.trim(),
      };
      if (editId) {
        await updateDoc(doc(db, "products", editId), data);
      } else {
        await addDoc(collection(db, "products"), {
          ...data,
          isActive: true,
          createdAt: serverTimestamp(),
        });
      }
      setOpen(false);
    } catch {
      setError("Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (p: Product) =>
    updateDoc(doc(db, "products", p.id), { isActive: !p.isActive });

  const remove = async (p: Product) => {
    if (confirm(`"${p.name}" o'chirilsinmi? Bu amalni ortga qaytarib bo'lmaydi.`)) {
      await deleteDoc(doc(db, "products", p.id));
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-blush-200 bg-white text-sm focus:outline-none focus:border-rose";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-fraunces text-espresso text-2xl sm:text-3xl">Menyu</h1>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 bg-rose text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-rose-dark transition-colors"
        >
          <Plus size={16} /> Mahsulot qo'shish
        </button>
      </div>

      {/* Mahsulotlar jadvali */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-2xl border border-blush-200/60 overflow-hidden ${
              !p.isActive ? "opacity-55" : ""
            }`}
          >
            <div className="aspect-[5/3] bg-blush-50 relative">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blush-300">
                  <ImagePlus size={28} />
                </div>
              )}
              {!p.isActive && (
                <span className="absolute top-2 left-2 bg-espresso/70 text-white text-[11px] px-2 py-0.5 rounded-full">
                  Yashirilgan
                </span>
              )}
            </div>
            <div className="p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-espresso text-sm truncate">{p.name}</p>
                  <p className="text-xs text-espresso/40 truncate">
                    {p.category}
                    {p.weightLabel ? ` · ${p.weightLabel}` : ""}
                  </p>
                </div>
                <span className="text-rose-dark text-sm font-medium whitespace-nowrap">
                  {formatUzs(p.priceUzs)}
                </span>
              </div>
              <div className="flex gap-1.5 mt-3">
                <button
                  onClick={() => startEdit(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-blush-200 text-espresso/60 text-xs hover:border-rose hover:text-rose transition-colors"
                >
                  <Pencil size={13} /> Tahrirlash
                </button>
                <button
                  onClick={() => toggleActive(p)}
                  title={p.isActive ? "Saytdan yashirish" : "Saytda ko'rsatish"}
                  className="px-3 py-2 rounded-xl border border-blush-200 text-espresso/60 hover:border-rose hover:text-rose transition-colors"
                >
                  {p.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => remove(p)}
                  title="O'chirish"
                  className="px-3 py-2 rounded-xl border border-blush-200 text-espresso/60 hover:border-red-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-espresso/50 py-8 text-center">
          Menyu bo'sh. &quot;Mahsulot qo'shish&quot; tugmasini bosing.
        </p>
      )}

      {/* Qo'shish/tahrirlash oynasi */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-fraunces text-espresso text-xl">
                {editId ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-blush-50"
              >
                <X size={18} className="text-espresso/60" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Rasm yuklash */}
              <div className="flex items-center gap-4">
                <div className="w-28 h-20 rounded-xl bg-blush-50 border border-blush-200 overflow-hidden flex items-center justify-center shrink-0">
                  {uploading ? (
                    <Loader2 size={20} className="text-rose animate-spin" />
                  ) : form.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus size={22} className="text-blush-300" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={pickImage}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-blush-300 text-rose text-sm font-medium hover:bg-blush-50 disabled:opacity-50 transition-colors"
                  >
                    {uploading ? "Yuklanmoqda..." : "Kompyuterdan rasm tanlash"}
                  </button>
                </div>
              </div>

              <input placeholder="Nomi (o'zbekcha) *" value={form.name} onChange={set("name")} className={inputCls} />
              <input placeholder="Название (ruscha)" value={form.name_ru} onChange={set("name_ru")} className={inputCls} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Kategoriya * (Tortlar...)" value={form.category} onChange={set("category")} className={inputCls} list="categories" />
                <datalist id="categories">
                  {[...new Set(products.map((p) => p.category))].map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <input placeholder="Категория (ruscha)" value={form.category_ru} onChange={set("category_ru")} className={inputCls} />
                <input placeholder="Vazn/miqdor (1.5 kg, 6 dona)" value={form.weightLabel} onChange={set("weightLabel")} className={inputCls} />
              </div>
              <input
                placeholder="Narxi (so'm) *"
                inputMode="numeric"
                value={form.priceUzs}
                onChange={(e) => setForm({ ...form, priceUzs: e.target.value.replace(/[^\d]/g, "") })}
                className={inputCls}
              />

              {error && (
                <p className="text-sm text-rose-dark bg-blush-50 border border-blush-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                onClick={save}
                disabled={saving || uploading}
                className="w-full bg-rose text-white py-3 rounded-full font-medium hover:bg-rose-dark disabled:opacity-50 transition-colors"
              >
                {saving ? "Saqlanmoqda..." : editId ? "Saqlash" : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
