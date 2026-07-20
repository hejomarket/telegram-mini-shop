export type RuntimeMode = 'supabase' | 'demo';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export type OrderItemInput = {
  productId: string;
  quantity: number;
};

export type OrderItemSnapshot = {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type PersistedOrder = {
  id?: string;
  orderNumber: string;
  customerName: string;
  whatsapp: string;
  email: string | null;
  address: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string | null;
  telegramUserId: number | null;
  telegramUsername: string | null;
  telegramFirstName: string | null;
  telegramLastName: string | null;
  telegramLanguage: string | null;
  subtotal: number;
  grandTotal: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string | null;
  items: OrderItemSnapshot[];
};
