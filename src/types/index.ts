export type DeliveryMethod = '配送' | '配達' | '店頭受取';
export type PaymentMethod = '現金' | 'PayPay' | '未収';
export type PaymentStatus = '未払い' | '支払済';
export type ReservationStatus = '仮予約' | '確定' | 'キャンセル';
export type OrderStatus = '確定' | '準備中' | '配達予定' | '完了' | 'キャンセル';
export type PricingMode = 'fixed' | 'derived';
export type StaffRole = 'オーナー' | 'スタッフ' | '配達';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  color: string;
  phone: string;
  is_active: boolean;
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

export interface Reservation {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  desired_date: string;
  desired_time: string;
  delivery_method: DeliveryMethod;
  items_note: string;
  memo: string;
  status: ReservationStatus;
  assignee_id: string | null;
  assignee?: Staff;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  reservation_id: string | null;
  customer_name: string;
  phone: string;
  address: string;
  has_box: boolean;
  packing_note: string;
  scheduled_date: string;
  scheduled_time: string;
  delivery_method: DeliveryMethod;
  shipping_fee: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  total: number;
  status: OrderStatus;
  assignee_id: string | null;
  delivery_staff_id: string | null;
  google_calendar_event_id: string | null;
  assignee?: Staff;
  delivery_staff?: Staff;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  variety_id: string | null;
  set_id: string | null;
  quantity: number;
  unit_price_snapshot: number;
  line_total: number;
  variety?: Variety;
  set?: ProductSet;
}
