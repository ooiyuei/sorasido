export type DeliveryMethod = '配送' | '配達' | '店頭受取';
export type PaymentMethod = '現金' | 'PayPay' | '振込' | '未定';
export type PaymentStatus = '未払い' | '支払済';
export type ReceptionStatus = '相談中' | '受付済み' | '会計待ち' | '完了' | 'キャンセル';
export type PricingMode = 'fixed' | 'derived';
export type PricingType = 'by_weight' | 'fixed' | 'count';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  line_name: string;
  memo: string;
  last_delivery_method: DeliveryMethod | '';
  frequent_items: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Variety {
  id: string;
  name: string;
  expected_quantity: number;
  reserved_quantity: number;
  pricing_type: PricingType;
  price_per_100g: number;
  unit_price: number;
  box_fee: number;
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
  // snapshots
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  customer_address_snapshot: string;
  // delivery
  desired_date: string;
  desired_time: string;
  delivery_method: DeliveryMethod;
  items_note: string;
  has_box: boolean;
  box_count: number;
  packing_note: string;
  // payment (confirmed at accounting)
  shipping_fee: number;
  discount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  total: number;
  // status
  status: ReceptionStatus;
  date_confirmed: boolean;
  weighed: boolean;
  delivered: boolean;
  // meta
  memo: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // relations
  items?: ReceptionItem[];
  customer?: Customer;
}

export interface ReceptionItem {
  id: string;
  reception_id: string;
  variety_id: string | null;
  set_id: string | null;
  quantity: number;
  planned_quantity_text: string;
  actual_weight_g: number | null;
  unit_price_snapshot: number;
  line_total: number;
  variety?: Variety;
  set?: ProductSet;
}

export interface SalesRecord {
  id: string;
  reception_id: string;
  customer_name: string;
  date: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  created_at: string;
}
