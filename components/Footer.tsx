"use client";

import { AtSign, Clock, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { BRANCHES } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-espresso text-cream/90 mt-16">
      <div className="grid lg:grid-cols-[300px_1fr] gap-10">
          <div>
            <div className="flex items-baseline gap-1.5 mb-4">
              <span className="font-fraunces text-3xl text-cream">Bika</span>
              <span className="text-[11px] tracking-[0.3em] uppercase text-rose-light">
                Bakery
              </span>
            </div>
            <p className="text-cream/50 text-sm leading-relaxed max-w-xs">
              {t("about")}
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-cream/10 hover:bg-rose text-sm transition-colors"
              >
                <AtSign size={15} /> Instagram
              </a>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {BRANCHES.map((b) => (
              <div key={b.id}>
                <h3 className="font-fraunces text-base text-cream mb-2.5">{b.name}</h3>
                <ul className="space-y-2 text-cream/50 text-sm">
                  <li className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-gold" />
                    {b.address}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={14} className="shrink-0 text-gold" />
                    <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="hover:text-cream">
                      {b.phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock size={14} className="shrink-0 text-gold" />
                    09:00 — 21:00
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
    </footer>
  );
}
