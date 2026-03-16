/**
 * ローカルインメモリストア
 * Supabase接続前のMVP用。接続後はsupabaseクライアントに置き換える。
 * TODO: Supabase接続時にこのファイルを supabase クエリに置き換える
 */

import { Staff, Variety, ProductSet, SetItem, Reservation, Order, OrderItem } from '@/types';
import { v4 as uuid } from 'uuid';

// --- 初期データ ---
const initialStaff: Staff[] = [
  { id: 'st1', name: '大井', role: 'オーナー', color: '#7c3aed', phone: '090-0000-0001', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'st2', name: '田中', role: 'スタッフ', color: '#2563eb', phone: '090-0000-0002', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'st3', name: '佐藤', role: '配達', color: '#059669', phone: '090-0000-0003', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
];

const initialVarieties: Variety[] = [
  { id: 'v1', name: 'シャインマスカット', expected_quantity: 100, reserved_quantity: 0, unit_price: 1500, low_stock_threshold: 10, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v2', name: 'ゴルビー', expected_quantity: 80, reserved_quantity: 0, unit_price: 1200, low_stock_threshold: 10, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v3', name: 'BKシードレス', expected_quantity: 60, reserved_quantity: 0, unit_price: 1000, low_stock_threshold: 5, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v4', name: 'ピオーネ', expected_quantity: 50, reserved_quantity: 0, unit_price: 800, low_stock_threshold: 5, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v5', name: '巨峰', expected_quantity: 70, reserved_quantity: 0, unit_price: 700, low_stock_threshold: 10, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
];

const initialSetItems: SetItem[] = [
  { id: 'si1', set_id: 's1', variety_id: 'v3', quantity: 1 },
  { id: 'si2', set_id: 's1', variety_id: 'v1', quantity: 1 },
  { id: 'si3', set_id: 's1', variety_id: 'v2', quantity: 1 },
  { id: 'si4', set_id: 's2', variety_id: 'v1', quantity: 1 },
  { id: 'si5', set_id: 's2', variety_id: 'v2', quantity: 1 },
];

const initialSets: ProductSet[] = [
  { id: 's1', name: 'お盆セット', price: 2500, pricing_mode: 'fixed', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01', items: initialSetItems.filter(si => si.set_id === 's1') },
  { id: 's2', name: 'プレミアムセット', price: 4000, pricing_mode: 'fixed', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01', items: initialSetItems.filter(si => si.set_id === 's2') },
];

const initialReservations: Reservation[] = [
  { id: 'r1', customer_name: '田中太郎', phone: '090-1234-5678', address: '岡山県岡山市北区1-1-1', desired_date: '2026-08-10', desired_time: '午前', delivery_method: '配達', items_note: 'お盆セット×2', memo: 'お盆用、のし付き希望', status: '確定', assignee_id: 'st1', created_at: '2026-03-01', updated_at: '2026-03-01' },
  { id: 'r2', customer_name: '山本花子', phone: '080-9876-5432', address: '岡山県倉敷市2-2-2', desired_date: '2026-08-15', desired_time: '午後', delivery_method: '配送', items_note: 'シャインマスカット3房', memo: '', status: '仮予約', assignee_id: 'st2', created_at: '2026-03-05', updated_at: '2026-03-05' },
];

const initialOrderItems: OrderItem[] = [
  { id: 'oi1', order_id: 'o1', variety_id: null, set_id: 's1', quantity: 2, unit_price_snapshot: 2500, line_total: 5000 },
  { id: 'oi2', order_id: 'o2', variety_id: null, set_id: 's2', quantity: 1, unit_price_snapshot: 4000, line_total: 4000 },
  { id: 'oi3', order_id: 'o3', variety_id: 'v1', set_id: null, quantity: 2, unit_price_snapshot: 1500, line_total: 3000 },
  { id: 'oi4', order_id: 'o3', variety_id: 'v2', set_id: null, quantity: 1, unit_price_snapshot: 1200, line_total: 1200 },
];

const initialOrders: Order[] = [
  { id: 'o1', reservation_id: 'r1', customer_name: '田中太郎', phone: '090-1234-5678', address: '岡山県岡山市北区1-1-1', has_box: true, packing_note: '2箱に分ける', scheduled_date: '2026-08-10', scheduled_time: '午前', delivery_method: '配達', shipping_fee: 0, payment_method: '現金', payment_status: '支払済', subtotal: 5000, total: 5000, status: '確定', assignee_id: 'st1', delivery_staff_id: 'st3', google_calendar_event_id: null, created_at: '2026-03-01', updated_at: '2026-03-01', items: initialOrderItems.filter(oi => oi.order_id === 'o1') },
  { id: 'o2', reservation_id: null, customer_name: '佐藤一郎', phone: '070-1111-2222', address: '東京都渋谷区3-3-3', has_box: true, packing_note: '', scheduled_date: '2026-08-12', scheduled_time: '指定なし', delivery_method: '配送', shipping_fee: 1500, payment_method: 'PayPay', payment_status: '支払済', subtotal: 4000, total: 5500, status: '準備中', assignee_id: 'st2', delivery_staff_id: null, google_calendar_event_id: null, created_at: '2026-03-02', updated_at: '2026-03-02', items: initialOrderItems.filter(oi => oi.order_id === 'o2') },
  { id: 'o3', reservation_id: null, customer_name: '鈴木次郎', phone: '090-3333-4444', address: '', has_box: false, packing_note: '', scheduled_date: '2026-08-10', scheduled_time: '10:00', delivery_method: '店頭受取', shipping_fee: 0, payment_method: '未収', payment_status: '未払い', subtotal: 4200, total: 4200, status: '確定', assignee_id: 'st1', delivery_staff_id: null, google_calendar_event_id: null, created_at: '2026-03-03', updated_at: '2026-03-03', items: initialOrderItems.filter(oi => oi.order_id === 'o3') },
];

// --- ストア ---
let staff = [...initialStaff];
let varieties = [...initialVarieties];
let sets = initialSets.map(s => ({ ...s }));
let setItems = [...initialSetItems];
let reservations = [...initialReservations];
let orders = initialOrders.map(o => ({ ...o }));
let orderItems = [...initialOrderItems];

function recalcReserved() {
  for (const v of varieties) {
    let total = 0;
    for (const o of orders) {
      if (o.status === 'キャンセル') continue;
      const items = orderItems.filter(oi => oi.order_id === o.id);
      for (const oi of items) {
        if (oi.variety_id === v.id) total += oi.quantity;
        if (oi.set_id) {
          const sis = setItems.filter(si => si.set_id === oi.set_id && si.variety_id === v.id);
          for (const si of sis) total += oi.quantity * si.quantity;
        }
      }
    }
    v.reserved_quantity = total;
  }
}
recalcReserved();

const now = () => new Date().toISOString();

function attachStaff<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  if ('assignee_id' in obj && obj.assignee_id) {
    (result as Record<string, unknown>).assignee = staff.find(s => s.id === obj.assignee_id);
  }
  if ('delivery_staff_id' in obj && obj.delivery_staff_id) {
    (result as Record<string, unknown>).delivery_staff = staff.find(s => s.id === obj.delivery_staff_id);
  }
  return result;
}

// --- Staff CRUD ---
export function getStaffList(): Staff[] { return staff.filter(s => s.is_active).map(s => ({ ...s })); }
export function getAllStaff(): Staff[] { return staff.map(s => ({ ...s })); }
export function getStaffById(id: string): Staff | undefined { return staff.find(s => s.id === id); }
export function createStaff(data: { name: string; role: string; color: string; phone: string }): Staff {
  const s: Staff = { id: uuid(), name: data.name, role: data.role as Staff['role'], color: data.color, phone: data.phone, is_active: true, created_at: now(), updated_at: now() };
  staff.push(s); return s;
}
export function updateStaff(id: string, data: Partial<Staff>): Staff | null {
  const s = staff.find(s => s.id === id); if (!s) return null;
  Object.assign(s, data, { updated_at: now() }); return { ...s };
}

// --- Varieties CRUD ---
export function getVarieties(): Variety[] { return varieties.filter(v => v.is_active).map(v => ({ ...v })); }
export function getVariety(id: string): Variety | undefined { return varieties.find(v => v.id === id); }
export function createVariety(data: { name: string; expected_quantity: number; unit_price?: number; low_stock_threshold?: number }): Variety {
  const v: Variety = { id: uuid(), name: data.name, expected_quantity: data.expected_quantity, unit_price: data.unit_price || 0, low_stock_threshold: data.low_stock_threshold || 10, is_active: true, reserved_quantity: 0, created_at: now(), updated_at: now() };
  varieties.push(v); return v;
}
export function updateVariety(id: string, data: Partial<Pick<Variety, 'name' | 'expected_quantity' | 'unit_price' | 'low_stock_threshold' | 'is_active'>>): Variety | null {
  const v = varieties.find(v => v.id === id); if (!v) return null;
  Object.assign(v, data, { updated_at: now() }); return { ...v };
}
export function deleteVariety(id: string): boolean {
  const v = varieties.find(v => v.id === id); if (!v) return false;
  v.is_active = false; return true;
}

// --- Sets CRUD ---
export function getSets(): ProductSet[] {
  return sets.map(s => ({ ...s, items: setItems.filter(si => si.set_id === s.id).map(si => ({ ...si, variety: varieties.find(v => v.id === si.variety_id) })) }));
}
export function getSet(id: string): ProductSet | undefined {
  const s = sets.find(s => s.id === id); if (!s) return undefined;
  return { ...s, items: setItems.filter(si => si.set_id === s.id).map(si => ({ ...si, variety: varieties.find(v => v.id === si.variety_id) })) };
}
export function createSet(data: { name: string; price: number; pricing_mode?: string; is_active: boolean; items: { variety_id: string; quantity: number }[] }): ProductSet {
  const id = uuid();
  sets.push({ id, name: data.name, price: data.price, pricing_mode: (data.pricing_mode || 'fixed') as ProductSet['pricing_mode'], is_active: data.is_active, created_at: now(), updated_at: now() });
  for (const item of data.items) setItems.push({ id: uuid(), set_id: id, variety_id: item.variety_id, quantity: item.quantity });
  return getSet(id)!;
}
export function updateSet(id: string, data: { name?: string; price?: number; pricing_mode?: string; is_active?: boolean; items?: { variety_id: string; quantity: number }[] }): ProductSet | null {
  const s = sets.find(s => s.id === id); if (!s) return null;
  if (data.name !== undefined) s.name = data.name;
  if (data.price !== undefined) s.price = data.price;
  if (data.pricing_mode !== undefined) s.pricing_mode = data.pricing_mode as ProductSet['pricing_mode'];
  if (data.is_active !== undefined) s.is_active = data.is_active;
  if (data.items) {
    setItems = setItems.filter(si => si.set_id !== id);
    for (const item of data.items) setItems.push({ id: uuid(), set_id: id, variety_id: item.variety_id, quantity: item.quantity });
  }
  s.updated_at = now(); return getSet(id)!;
}
export function deleteSet(id: string): boolean {
  const idx = sets.findIndex(s => s.id === id); if (idx === -1) return false;
  sets.splice(idx, 1); setItems = setItems.filter(si => si.set_id !== id); return true;
}

// --- Reservations CRUD ---
export function getReservations(): Reservation[] { return reservations.map(r => attachStaff({ ...r }) as Reservation); }
export function getReservation(id: string): Reservation | undefined {
  const r = reservations.find(r => r.id === id); if (!r) return undefined;
  return attachStaff({ ...r }) as Reservation;
}
export function createReservation(data: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'assignee'>): Reservation {
  const r = { id: uuid(), ...data, created_at: now(), updated_at: now() } as Reservation;
  reservations.push(r); return attachStaff({ ...r }) as Reservation;
}
export function updateReservation(id: string, data: Partial<Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'assignee'>>): Reservation | null {
  const r = reservations.find(r => r.id === id); if (!r) return null;
  Object.assign(r, data, { updated_at: now() }); return attachStaff({ ...r }) as Reservation;
}
export function deleteReservation(id: string): boolean {
  const idx = reservations.findIndex(r => r.id === id); if (idx === -1) return false;
  reservations.splice(idx, 1); return true;
}

// --- Orders CRUD ---
function enrichOrder(o: Order): Order {
  return attachStaff({
    ...o,
    items: orderItems.filter(oi => oi.order_id === o.id).map(oi => ({
      ...oi, variety: oi.variety_id ? varieties.find(v => v.id === oi.variety_id) : undefined,
      set: oi.set_id ? getSet(oi.set_id) : undefined,
    })),
  }) as Order;
}
export function getOrders(): Order[] { return orders.map(enrichOrder); }
export function getOrder(id: string): Order | undefined {
  const o = orders.find(o => o.id === id); if (!o) return undefined;
  return enrichOrder(o);
}
export function createOrder(data: {
  reservation_id?: string | null;
  customer_name: string; phone: string; address: string;
  has_box: boolean; packing_note: string;
  scheduled_date: string; scheduled_time: string;
  delivery_method: '配送' | '配達' | '店頭受取';
  payment_method: '現金' | 'PayPay' | '未収';
  payment_status?: '未払い' | '支払済';
  status: '確定' | '準備中' | '配達予定' | '完了' | 'キャンセル';
  assignee_id?: string | null;
  delivery_staff_id?: string | null;
  items: { variety_id?: string | null; set_id?: string | null; quantity: number; unit_price_snapshot: number }[];
}): Order {
  const id = uuid();
  const shipping_fee = data.delivery_method === '配送' ? 1500 : 0;
  const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.unit_price_snapshot, 0);
  const total = subtotal + shipping_fee;
  const o: Order = {
    id, reservation_id: data.reservation_id || null,
    customer_name: data.customer_name, phone: data.phone, address: data.address,
    has_box: data.has_box, packing_note: data.packing_note,
    scheduled_date: data.scheduled_date, scheduled_time: data.scheduled_time,
    delivery_method: data.delivery_method, shipping_fee,
    payment_method: data.payment_method,
    payment_status: data.payment_status || (data.payment_method === '未収' ? '未払い' : '支払済'),
    subtotal, total, status: data.status,
    assignee_id: data.assignee_id || null,
    delivery_staff_id: data.delivery_staff_id || null,
    google_calendar_event_id: null,
    created_at: now(), updated_at: now(),
  };
  orders.push(o);
  for (const item of data.items) {
    orderItems.push({
      id: uuid(), order_id: id,
      variety_id: item.variety_id || null, set_id: item.set_id || null,
      quantity: item.quantity,
      unit_price_snapshot: item.unit_price_snapshot,
      line_total: item.quantity * item.unit_price_snapshot,
    });
  }
  recalcReserved(); return getOrder(id)!;
}
export function updateOrder(id: string, data: Partial<{
  customer_name: string; phone: string; address: string;
  has_box: boolean; packing_note: string;
  scheduled_date: string; scheduled_time: string;
  delivery_method: '配送' | '配達' | '店頭受取';
  payment_method: '現金' | 'PayPay' | '未収';
  payment_status: '未払い' | '支払済';
  status: '確定' | '準備中' | '配達予定' | '完了' | 'キャンセル';
  assignee_id: string | null;
  delivery_staff_id: string | null;
  google_calendar_event_id: string | null;
}>): Order | null {
  const o = orders.find(o => o.id === id); if (!o) return null;
  Object.assign(o, data, { updated_at: now() });
  if (data.delivery_method) {
    o.shipping_fee = data.delivery_method === '配送' ? 1500 : 0;
    o.total = o.subtotal + o.shipping_fee;
  }
  recalcReserved(); return getOrder(id)!;
}
export function deleteOrder(id: string): boolean {
  const idx = orders.findIndex(o => o.id === id); if (idx === -1) return false;
  orders.splice(idx, 1); orderItems = orderItems.filter(oi => oi.order_id !== id);
  recalcReserved(); return true;
}
export function getOrdersByDate(date: string): Order[] {
  return getOrders().filter(o => o.scheduled_date === date && o.status !== 'キャンセル');
}
export function getUnpaidOrders(): Order[] {
  return getOrders().filter(o => o.payment_status === '未払い' && o.status !== 'キャンセル' && o.status !== '完了');
}
