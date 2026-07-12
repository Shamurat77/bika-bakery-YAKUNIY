"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { fetchProfile } from "@/lib/authActions";
import { useAuthStore } from "@/lib/authStore";
import type { UserProfile } from "@/lib/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuth(null, null);
        return;
      }
      try {
        let profile = await fetchProfile(user.uid);
        // Profil topilmasa (yarim qolgan ro'yxatdan o'tish) — yaratamiz
        if (!profile) {
          const fresh = {
            uid: user.uid,
            name: user.displayName ?? "",
            phone: "",
            role: "mijoz" as const,
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, "users", user.uid), fresh);
          profile = (await fetchProfile(user.uid)) as UserProfile;
        }
        setAuth(user, profile);
      } catch (e) {
        console.error("Profil yuklashda xato:", e);
        setAuth(user, null);
      }
    });
    return unsub;
  }, [setAuth]);

  return <>{children}</>;
}