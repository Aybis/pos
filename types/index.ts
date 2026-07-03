export interface VariantOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface VariantGroup {
  id: string;
  name: string;
  type: "single" | "multi";
  required: boolean;
  options: VariantOption[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  emoji: string;
  stock: number;
  trackStock: boolean;
  allowNotes: boolean;
  notesHint?: string;
  variantGroups: VariantGroup[];
  active?: boolean;
}

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  emoji: string;
  qty: number;
  unitPrice: number;
  selectedOptions: Record<string, string | string[]>;
  variantText: string;
  notes?: string;
}

export interface TransactionItem {
  productId: string;
  name: string;
  emoji: string;
  qty: number;
  unitPrice: number;
  selectedOptions: Record<string, string | string[]>;
  variantText: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  number: number;
  createdAt: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paidAmount?: number;
  change?: number;
  status: "LUNAS" | "REFUND";
  refundedAt?: string;
}

export interface Settings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  taxPercent: number;
  receiptFooter: string;
}

export interface User {
  name: string;
  role: "admin" | "pegawai";
}

export type ToastType = "success" | "error";