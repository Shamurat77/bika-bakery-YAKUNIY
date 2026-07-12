"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "./types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product)
      );
      setLoading(false);
    });
    return unsub;
  }, []);

  return { products: products.filter((p) => p.isActive), loading };
}