import type { Timestamp } from "firebase/firestore";
import type { BranchId } from "./constants";

export type Role = "mijoz" | "filial" | "admin";

export type OrderStatus = "yangi" | "tayyorlanmoqda" | "yolda" | "yetkazildi";
export type DeliveryType = "yetkazib_berish" | "kelib_olish";
export type PaymentMethod = "naqd" | "karta";

export type CakeColor = "oq" | "pushti" | "shokoladli";
export type CakeFlavor = "vanilli" | "shokoladli" | "red_velvet" | "limonli";

// Firestore kolleksiya: "products"
export interface Product {
  id: string;
  name: string;
  name_ru: string;
  category: string;
  category_ru: string;
  description: string;
  description_ru: string;
  weightLabel: string;
  priceUzs: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface CustomCakeConfig {
  tiers: 1 | 2 | 3;
  color: CakeColor;
  flavor: CakeFlavor;
  weightKg: number; // avtomatik: TIER_WEIGHTS[tiers]
  inscription: string;
  neededBy: string;
  notes: string;
}

export interface CartItem {
  key: string;
  productId?: string;
  name: string;
  unitPrice: number;
  qty: number;
  imageUrl?: string;
  weightLabel?: string;
  customConfig?: CustomCakeConfig;
}

// Buyurtma ichida saqlanadigan item (alohida kolleksiya EMAS)
export interface OrderItem {
  productId: string | null;
  name: string;
  qty: number;
  unitPriceUzs: number;
  customConfig: CustomCakeConfig | null;
}

// Firestore kolleksiya: "orders"
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: BranchId;
  deliveryType: DeliveryType;
  address: string;
  courierComment: string;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  cardLast4: string;
  status: OrderStatus;
  items: OrderItem[];
  goodsUzs: number;
  deliveryFeeUzs: number;
  totalUzs: number;
  rating: number | null;
  ratingComment: string;
  createdAt: Timestamp;
}

// Firestore kolleksiya: "users"
export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  role: Role;
  createdAt: Timestamp;
}

// Firestore kolleksiya: "inventory" (ombor)
export interface InventoryItem {
  id: string;
  name: string;
  unit: string; // kg, litr, dona...
  qty: number;
  minQty: number; // shu miqdordan kamaysa ogohlantirish
  updatedAt: Timestamp;
}

// Firestore kolleksiya: "inventory_moves" (ombor harakatlari)
export interface InventoryMove {
  id: string;
  itemId: string;
  itemName: string;
  unit: string;
  type: "kirim" | "chiqim";
  qty: number;
  note: string;
  createdAt: Timestamp;
}
