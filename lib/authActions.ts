import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { UserProfile } from "./types";

export async function registerUser(
  name: string,
  phone: string,
  email: string,
  password: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    name,
    phone,
    role: "mijoz",
    createdAt: serverTimestamp(),
  });
  return cred.user;
}

export async function loginUser(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function fetchProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

// Firebase xato kodlarini o'zbekchaga o'girish
export function authErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Bu email allaqachon ro'yxatdan o'tgan";
    case "auth/invalid-email":
      return "Email noto'g'ri kiritilgan";
    case "auth/weak-password":
      return "Parol juda oddiy (kamida 6 belgi)";
    case "auth/invalid-credential":
      return "Email yoki parol noto'g'ri";
    case "auth/too-many-requests":
      return "Juda ko'p urinish. Birozdan keyin qayta urining";
    case "auth/operation-not-allowed":
      return "Email/Parol usuli Firebase konsolida yoqilmagan";
    case "auth/network-request-failed":
      return "Internet aloqasi yo'q. Qayta urinib ko'ring";
    default:
      return "Xatolik yuz berdi. Qayta urinib ko'ring";
  }
}
