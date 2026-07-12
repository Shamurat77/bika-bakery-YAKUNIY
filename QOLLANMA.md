# Bika Bakery — Ishga tushirish qo'llanmasi

## 1. O'rnatish (ZIP'ni ochgandan keyin)

```bash
npm install
npm run dev
```

`.env.local` fayli loyihada bor (Firebase kalitlari bilan). Agar yo'q bo'lsa, eskisidan ko'chiring.

## 2. O'zingizni ADMIN qilish (1 daqiqa)

1. Saytda oddiy foydalanuvchi sifatida ro'yxatdan o'ting (agar hali bo'lmasangiz)
2. Firebase konsol -> Firestore Database -> `users` kolleksiyasi
3. O'z hujjatingizni oching (ismingiz bo'yicha topasiz)
4. `role` maydonini `mijoz` dan `admin` ga o'zgartiring -> Save
5. Saytni yangilang -> Header'da qora qalqon (shield) belgisi chiqadi -> bosing -> Admin panel

## 3. Cloudinary — rasm yuklash uchun (2 daqiqa, bepul)

Menyuda "Kompyuterdan rasm tanlash" ishlashi uchun:

1. https://cloudinary.com -> bepul ro'yxatdan o'ting
2. Dashboard'da **Cloud name** ni ko'chiring (masalan: `dxy12abc`)
3. Settings (tishli belgi) -> **Upload** -> **Upload presets** -> Add upload preset
   - Signing Mode: **Unsigned** (muhim!)
   - Preset nomini ko'chiring (masalan: `bika_unsigned`)
   - Save
4. `.env.local` ga qo'shing:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxy12abc
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=bika_unsigned
```

5. Dev serverni qayta ishga tushiring (`Ctrl+C` -> `npm run dev`)

Cloudinary sozlanmagan bo'lsa ham menyu ishlaydi — rasm URL'ini qo'lda joylash mumkin.

## 4. Launch'dan oldin — Firestore xavfsizlik qoidalari

Hozir bazada "test mode" qoidalari turibdi (muddati cheklangan va hamma yoza oladi).
Saytni ochishdan oldin:

1. Firebase konsol -> Firestore Database -> **Rules**
2. Loyihadagi `firestore.rules` faylini oching, hammasini ko'chiring
3. Konsoldagi qoidalar o'rniga qo'ying -> **Publish**

Bu qoidalar: katalog hammaga ochiq, buyurtmani faqat egasi va admin ko'radi,
mijoz faqat baho qo'ya oladi, ombor/menyu faqat adminga.

## 5. Admin panel bo'limlari

- **Dashboard** — buyurtmalar soni, jami summa, o'rtacha chek, sotilgan mahsulotlar,
  o'rtacha baho + sana filtri (Dan/Gacha) + kunlik savdo grafigi
- **Buyurtmalar** — holat bo'yicha filtr, holatni tugma bilan o'zgartirish
  (Yangi -> Tayyorlanmoqda -> Yo'lda -> Yetkazildi; mijoz sahifasida jonli siljiydi),
  mijoz bahosi (yulduz + izoh) faqat shu yerda ko'rinadi, Excel export
- **Menyu** — mahsulot qo'shish/tahrirlash/yashirish/o'chirish, kompyuterdan rasm yuklash,
  UZ/RU nomlar, kategoriya avtomatik taklif qilinadi
- **Ombor** — xomashyo qo'shish, kirim/chiqim, kam qoldiq ogohlantirishi,
  harakatlar tarixi, Excel hisobot

## 6. Keyingi qadamlar (ixtiyoriy, kelajakda)

- Payme/Click merchant integratsiyasi (hozir karta formasi simulyatsiya rejimida,
  buyurtmada `paymentStatus` maydoni tayyor turibdi)
- `/seed` sahifasini o'chirish (sinov mahsulotlari sahifasi — launch'dan oldin
  `app/[locale]/seed` papkasini o'chiring)
- Domen ulash va Vercel'ga deploy: `npx vercel` (Vercel .env o'zgaruvchilarini
  dashboard'da qo'shishni unutmang)

## 7. Filial paneli va rol almashtirgich (YANGI)

**Filial paneli** (`/filial`) — Kanban doska: Yangi | Tayyorlanmoqda | Yo'lda ustunlari.
Har kartada mijoz, telefon, manzil, mahsulotlar (maxsus tort tafsilotlari bilan) va
"keyingi bosqich" tugmasi. Yuqorida filial filtri (Toshkent City / Uzbekistan Hotel /
Hammasi) va Faol/Tarix tablari. Holat o'zgarishi mijoz sahifasida jonli ko'rinadi.

**Rol almashtirgich** — Header'da qora segmentli tugmalar:
Foydalanuvchi | Filial | Admin. Taqdimotda uch panelni bir akkaunt bilan
ko'rsatish uchun qulay:
- admin roli: uchala tugma ham ko'rinadi
- filial roli: Foydalanuvchi + Filial ko'rinadi
- mijoz: tugmalar ko'rinmaydi (oddiy sayt)

**Foydalanuvchilar** (Admin -> Foydalanuvchilar) — rollarni jadvaldan bir bosishda
o'zgartirish: Mijoz / Filial / Admin. Firestore konsolga kirish shart emas endi.
Demo uchun: bitta test akkauntni "Filial" qilib, filial panelini alohida
brauzerda ochib ko'rsatish mumkin.

## Diyora Usmonovaga taqdimot ssenariysi (tavsiya)

1. Bosh sahifa: dizayn, UZ/RU almashtirish, katalog, kartochkada +/- stepper
2. Maxsus tort: qavat -> vazn avtomatik, rang -> preview bo'yaladi, jonli narx
3. Savat -> checkout: karta formasi (avtoformat), SMS kod, chek
4. "Buyurtmalarim": holat chizig'i
5. Header'dagi tugma: **Filial** -> Kanban'da buyurtmani "Tayyorlashni boshlash"
   -> ikkinchi oynada mijoz sahifasida chiziq jonli siljiganini ko'rsatish
6. **Admin** -> Dashboard grafigi, Buyurtmalar (baho ko'rinadi), Menyu (rasm yuklash),
   Ombor, Foydalanuvchilar (rol berish), Excel export
