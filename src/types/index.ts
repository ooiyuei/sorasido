export type DeliveryMethod = '配送' | '配達' | '店頭受取';
export type PaymentMethod = '現金' | 'PayPay' | '未収';
export type PaymentStatus = '未払い' | '支払済';
export type ReceptionStatus = '相談中' | '仮予約' | '注文確定' | '準備中' | '受渡し待ち' | '完了' | 'キャンセル';
export type PricingMode = 'fixed' | 'derived';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  memo: string;
  created_at: string;
  updated_at: string;
}

export interface Variety {
  id: string;
  name: string;
  expected_quantity: number;
  reserved_quantity: number;
  unit_price: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSet {
  id: string;
  name: string;
  price: number;
  pricing_mode: PricingMode;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items?: SetItem[];
}

export interface SetItem {
  id: string;
  set_id: string;
  variety_id: string;
  quantity: number;
  variety?: Variety;
}

export interface Reception {
  id: string;
  customer_id: string;
  customer_name: string;
  phone: string;
  address: string;
  desired_date: string;
  desired_time: string;
  delivery_method: DeliveryMethod;
  items_note: string;
  has_box: boolean;
  packing_note: string;
  shipping_fee: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  total: number;
  status: ReceptionStatus;
  memo: string;
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
  items?: ReceptionItem[];
  customer?: Customer;
}

export interface ReceptionItem {
  id: string;
  reception_id: string;
  variety_id: string | null;
  set_id: string | null;
  quantity: number;
  unit_price_snapshot: number;
  line_total: number;
  variety?: Variety;
  set?: ProductSet;
}
