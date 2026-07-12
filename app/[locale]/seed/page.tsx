"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SAMPLE = [
  { name: "Qulupnayli tort", name_ru: "Клубничный торт", category: "Tortlar", category_ru: "Торты", weightLabel: "1.5 kg", priceUzs: 280000, img: "cake1" },
  { name: "Shokoladli tort", name_ru: "Шоколадный торт", category: "Tortlar", category_ru: "Торты", weightLabel: "2 kg", priceUzs: 350000, img: "cake2" },
  { name: "Red Velvet", name_ru: "Ред Вельвет", category: "Tortlar", category_ru: "Торты", weightLabel: "1.8 kg", priceUzs: 400000, img: "cake3" },
  { name: "Vanilli kapkeyk (6 dona)", name_ru: "Ванильные капкейки (6 шт)", category: "Kapkeyklar", category_ru: "Капкейки", weightLabel: "6 dona", priceUzs: 120000, img: "cup1" },
  { name: "Shokoladli kapkeyk (6 dona)", name_ru: "Шоколадные капкейки (6 шт)", category: "Kapkeyklar", category_ru: "Капкейки", weightLabel: "6 dona", priceUzs: 130000, img: "cup2" },
  { name: "Makaron to'plami (12 dona)", name_ru: "Набор макарон (12 шт)", category: "Desertlar", category_ru: "Десерты", weightLabel: "12 dona", priceUzs: 180000, img: "mac1" },
];

export default function SeedPage() {
  const [status, setStatus] = useState("Tayyor");

  const seed = async () => {
    setStatus("Yuklanmoqda...");
    for (const p of SAMPLE) {
      await addDoc(collection(db, "products"), {
        name: p.name,
        name_ru: p.name_ru,
        category: p.category,
        category_ru: p.category_ru,
        description: "",
        description_ru: "",
        weightLabel: p.weightLabel,
        priceUzs: p.priceUzs,
        imageUrl: `https://picsum.photos/seed/${p.img}/600/450`,
        isActive: true,
        createdAt: serverTimestamp(),
      });
    }
    setStatus("✅ 6 ta mahsulot qo'shildi! Bosh sahifaga qayting.");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <button onClick={seed} className="bg-rose text-white px-8 py-4 rounded-full font-medium">
        Sinov mahsulotlarini qo'shish
      </button>
      <p>{status}</p>
    </main>
  );
}