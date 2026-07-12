"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Cake } from "lucide-react";
import { registerUser, loginUser, authErrorMessage } from "@/lib/authActions";
import { useAuthStore } from "@/lib/authStore";
import { BlobAccent } from "@/components/BlobAccent";

export default function AuthPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Foydalanuvchi kirgan zahoti avtomatik yo'naltirish
  useEffect(() => {
    if (!loading && user) {
      router.replace(params.get("next") ?? "/");
    }
  }, [user, loading, router, params]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      if (mode === "register") {
        await registerUser(form.name, form.phone, form.email, form.password);
      } else {
        await loginUser(form.email, form.password);
      }
      // Yo'naltirishni yuqoridagi useEffect bajaradi
    } catch (e: unknown) {
      console.error("Auth xato:", e);
      const code = e instanceof Error && "code" in e ? String((e as { code: string }).code) : "";
      setError(authErrorMessage(code));
      setBusy(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-2xl border border-blush-200 bg-white focus:outline-none focus:border-rose transition-colors";

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <BlobAccent className="top-10 -left-20 w-72 h-72" color="#F3A9C5" opacity={0.2} variant={1} animate />
      <BlobAccent className="bottom-0 -right-20 w-96 h-96" color="#C89B5C" opacity={0.1} variant={3} />

      <div className="relative w-full max-w-md bg-white rounded-3xl border border-blush-200/60 shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blush-100 text-rose mb-4">
            <Cake size={22} />
          </div>
          <h1 className="font-fraunces text-espresso text-3xl">
            {mode === "login" ? t("loginTitle") : t("registerTitle")}
          </h1>
        </div>

        <div className="space-y-4">
          {mode === "register" && (
            <>
              <input placeholder={t("name")} value={form.name} onChange={set("name")} className={inputCls} />
              <input placeholder={t("phone")} value={form.phone} onChange={set("phone")} type="tel" className={inputCls} />
            </>
          )}
          <input placeholder={t("email")} value={form.email} onChange={set("email")} type="email" className={inputCls} />
          <input placeholder={t("password")} value={form.password} onChange={set("password")} type="password" className={inputCls} />

          {error && (
            <p className="text-sm text-rose-dark bg-blush-50 border border-blush-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            onClick={submit}
            disabled={busy}
            className="w-full bg-rose text-white py-3.5 rounded-full font-medium hover:bg-rose-dark transition-colors disabled:opacity-50"
          >
            {busy ? "..." : mode === "login" ? t("loginBtn") : t("registerBtn")}
          </button>
        </div>

        <p className="text-center text-sm text-espresso/60 mt-6">
          {mode === "login" ? t("noAccount") : t("haveAccount")}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-rose font-medium hover:underline"
          >
            {mode === "login" ? t("registerTitle") : t("loginTitle")}
          </button>
        </p>
      </div>
    </main>
  );
}