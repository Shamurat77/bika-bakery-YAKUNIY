import type { Metadata } from "next";
import { Fraunces, Jost } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const jost = Jost({ subsets: ["latin", "cyrillic"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Bika Bakery — Toshkentning premium konditerlik brendi",
  description:
    "Tabiiy mahsulotlar va qo'l mehnati bilan tayyorlangan premium tortlar va shirinliklar.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${jost.variable}`}
      suppressHydrationWarning
    >
     <body className="font-jost antialiased">
        <NextIntlClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}