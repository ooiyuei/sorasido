/**
 * ローカルインメモリストア
 * Supabase接続前のMVP用。接続後はsupabaseクライアントに置き換える。
 * TODO: Supabase接続時にこのファイルを supabase クエリに置き換える
 */

import { Variety, ProductSet, SetItem, Reservation, Order, OrderItem } from '@/types';
import { v4 as uuid } from 'uuid';

// --- 初期データ ---
const initialVarieties: Variety[] = [
  { id: 'v1', name: 'シャインマスカット', expected_quantity: 100, reserved_quantity: 0, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v2', name: 'ゴルビー', expected_quantity: 80, reserved_quantity: 0, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v3', name: 'BKシードレス', expected_quantity: 60, reserved_quantity: 0, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v4', name: 'ピオーネ', expected_quantity: 50, reserved_quantity: 0, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v5', name: '巨峰', expected_quantity: 70, reserved_quantity: 0, created_at: '2026-01-01', updated_at: '2026-01-01' },
];

const initialSetItems: SetItem[] = [
  { id: 'si1', set_id: 's1', variety_id: 'v3', quantity: 1 },
  { id: 'si2', set_id: 's1', variety_id: 'v1', quantity: 1 },
  { id: 'si3', set_id: 's1', variety_id: 'v2', quantity: 1 },
  { id: 'si4', set_id: 's2', variety_id: 'v1', quantity: 1 },
  { id: 'si5', set_id: 's2', variety_id: 'v2', quantity: 1 },
];

const initialSets: ProductSet[] = [
  { id: 's1', name: 'お盆セット', price: 2500, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01', items: initialSetItems.filter(si => si.set_id === 's1') },
  { id: 's2', name: 'プレミアムセット', price: 4000, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01', items: initialSetItems.filter(si => si.set_id === 's2') },
];

const initialReservations: Reservation[] = [
  { id: 'r1', customer_name: '田中太郎', phone: '090-1234-5678', address: '岡山県岡山市北区1-1-1', desired_date: '2026-08-10', desired_time: '午前', delivery_method: '配達', items_note: 'お盆セット×2', memo: 'お盆用、のし付き希望', status: '確定', created_at: '2026-03-01', updated_at: '2026-03-01' },
  { id: 'r2', customer_name: '山本花子', phone: '080-9876-5432', address: '岡山県倉敷市2-2-2', desired_date: '2026-08-15', desired_time: '午後', delivery_method: '配送', items_note: 'シャインマスカット3房', memo: '', status: '仮予約', created_at: '2026-03-05', updated_at: '2026-03-05' },
];

const initialOrderItems: OrderItem[] = [
  { id: 'oi1', order_id: 'o1', variety_id: null, set_id: 's1', quantity: 2, unit_price: 2500 },
  { id: 'oi2', order_id: 'o2', variety_id: null, set_id: 's2', quantity: 1, unit_price: 4000 },
  { id: 'oi3', order_id: 'o3', variety_id: 'v1', set_id: null, quantity: 2, unit_price: 1000 },
  { id: 'oi4', order_id: 'o3', variety_id: 'v2', set_id: null, quantity: 1, unit_price: 500 },
];

const initialOrders: Order[] = [
  { id: 'o1', reservation_id: 'r1', customer_name: '田中太郎', phone: '090-1234-5678', address: '岡山県岡山市北区1-1-1', has_box: true, packing_note: '2箱に分ける', scheduled_date: '2026-08-10', scheduled_time: '午前', delivery_method: '配達', shipping_fee: 0, payment_method: '現金', subtotal: 5000, total: 5000, status: '確定', created_at: '2026-03-01', updated_at: '2026-03-01', items: initialOrderItems.filter(oi => oi.order_id === 'o1') },
  { id: 'o2', reservation_id: null, customer_name: '佐藤一郎', phone: '070-1111-2222', address: '東京都渋谷区3-3-3', has_box: true, packing_note: '', scheduled_date: '2026-08-12', scheduled_time: '指定なし', delivery_method: '配送', shipping_fee: 1500, payment_method: 'PayPay', subtotal: 4000, total: 5500, status: '準備中', created_at: '2026-03-02', updated_at: '2026-03-02', items: initialOrderItems.filter(oi => oi.order_id === 'o2') },
  { id: 'o3', reservation_id: null, customer_name: '鈴木次郎', phone: '090-3333-4444', address: '', has_box: false, packing_note: '', scheduled_date: '2026-08-10', scheduled_time: '10:00', delivery_method: '店頭受取', shipping_fee: 0, payment_method: '未収', subtotal: 2500, total: 2500, status: '確定', created_at: '2026-03-03', updated_at: '2026-03-03', items: initialOrderItems.filter(oi => oi.order_id === 'o3') },
];

// --- ストア ---
let varieties = [...initialVarieties];
let sets = initialSets.map(s => ({ ...s }));
let setItems = [...initialSetItems];
let reservations = [...initialReservations];
let orders = initialOrders.map(o => ({ ...o }));
let orderItems = [...initialOrderItems];

// 在庫再計算
function recalcReserved() {
  for (const v of varieties) {
    let total = 0;
    for (const o of orders) {
      if (o.status === 'キャンセル') continue;
      const items = orderItems.filter(oi => oi.order_id === o.id);
      for (const oi of items) {
        if (oi.variety_id === v.id) {
          total += oi.quantity;
        }
        if (oi.set_id) {
          const sis = setItems.filter(si => si.set_id === oi.set_id && si.variety_id === v.id);
          for (const si of sis) {
            total += oi.quantity * si.quantity;
          }
        }
      }
    }
    v.reserved_quantity = total;
  }
}
recalcReserved();

const now = () => new Date().toISOString();

// --- Varieties CRUD ---
export function getVarieties(): Variety[] {
  return varieties.map(v => ({ ...v }));
}

export function getVariety(id: string): Variety | undefined {
  return varieties.find(v => v.id === id);
}

export function createVariety(data: { name: string; expected_quantity: number }): Variety {
  const v: Variety = { id: uuid(), ...data, reserved_quantity: 0, created_at: now(), updated_at: now() };
  varieties.push(v);
  return v;
}

export function updateVariety(id: string, data: Partial<Pick<Variety, 'name' | 'expected_quantity'>>): Variety | null {
  const v = varieties.find(v => v.id === id);
  if (!v) return null;
  Object.assign(v, data, { updated_at: now() });
  return { ...v };
}

export function deleteVariety(id: string): boolean {
  const idx = varieties.findIndex(v => v.id === id);
  if (idx === -1) return false;
  varieties.splice(idx, 1);
  return true;
}

// --- Sets CRUD ---
export function getSets(): ProductSet[] {
  return sets.map(s => ({
    ...s,
    items: setItems.filter(si => si.set_id === s.id).map(si => ({
      ...si,
      variety: varieties.find(v => v.id === si.variety_id),
    })),
  }));
}

export function getSet(id: string): ProductSet | undefined {
  const s = sets.find(s => s.id === id);
  if (!s) return undefined;
  return {
    ...s,
    items: setItems.filter(si => si.set_id === s.id).map(si => ({
      ...si,
      variety: varieties.find(v => v.id === si.variety_id),
    })),
  };
}

export function createSet(data: { name: string; price: number; is_active: boolean; items: { variety_id: string; quantity: number }[] }): ProductSet {
  const id = uuid();
  const s: ProductSet = { id, name: data.name, price: data.price, is_active: data.is_active, created_at: now(), updated_at: now() };
  sets.push(s);
  for (const item of data.items) {
    setItems.push({ id: uuid(), set_id: id, variety_id: item.variety_id, quantity: item.quantity });
  }
  return getSet(id)!;
}

export function updateSet(id: string, data: { name?: string; price?: number; is_active?: boolean; items?: { variety_id: string; quantity: number }[] }): ProductSet | null {
  const s = sets.find(s => s.id === id);
  if (!s) return null;
  if (data.name !== undefined) s.name = data.name;
  if (data.price !== undefined) s.price = data.price;
  if (data.is_active !== undefined) s.is_active = data.is_active;
  if (data.items) {
    setItems = setItems.filter(si => si.set_id !== id);
    for (const item of data.items) {
      setItems.push({ id: uuid(), set_id: id, variety_id: item.variety_id, quantity: item.quantity });
    }
  }
  s.updated_at = now();
  return getSet(id)!;
}

export function deleteSet(id: string): boolean {
  const idx = sets.findIndex(s => s.id === id);
  if (idx === -1) return false;
  sets.splice(idx, 1);
  setItems = setItems.filter(si => si.set_id !== id);
  return true;
}

// --- Reservations CRUD ---
export function getReservations(): Reservation[] {
  return reservations.map(r => ({ ...r }));
}

export function getReservation(id: string): Reservation | undefined {
  return reservations.find(r => r.id === id);
}

export function createReservation(data: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>): Reservation {
  const r: Reservation = { id: uuid(), ...data, created_at: now(), updated_at: now() };
  reservations.push(r);
  return r;
}

export function updateReservation(id: string, data: Partial<Omit<Reservation, 'id' | 'created_at' | 'updated_at'>>): Reservation | null {
  const r = reservations.find(r => r.id === id);
  if (!r) return null;
  Object.assign(r, data, { updated_at: now() });
  return { ...r };
}

export function deleteReservation(id: string): boolean {
  const idx = reservations.findIndex(r => r.id === id);
  if (idx === -1) return false;
  reservations.splice(idx, 1);
  return true;
}

// --- Orders CRUD ---
export function getOrders(): Order[] {
  return orders.map(o => ({
    ...o,
    items: orderItems.filter(oi => oi.order_id === o.id).map(oi => ({
      ...oi,
      variety: oi.variety_id ? varieties.find(v => v.id === oi.variety_id) : undefined,
      set: oi.set_id ? getSet(oi.set_id) : undefined,
    })),
  }));
}

export function getOrder(id: string): Order | undefined {
  const o = orders.find(o => o.id === id);
  if (!o) return undefined;
  return {
    ...o,
    items: orderItems.filter(oi => oi.order_id === o.id).map(oi => ({
      ...oi,
      variety: oi.variety_id ? varieties.find(v => v.id === oi.variety_id) : undefined,
      set: oi.set_id ? getSet(oi.set_id) : undefined,
    })),
  };
}

export function createOrder(data: {
  reservation_id?: string | null;
  customer_name: string;
  phone: string;
  address: string;
  has_box: boolean;
  packing_note: string;
  scheduled_date: string;
  scheduled_time: string;
  delivery_method: '配送' | '配達' | '店頭受取';
  payment_method: '現金' | 'PayPay' | '未収';
  status: '確定' | '準備中' | '配達予定' | '完了' | 'キャンセル';
  items: { variety_id?: string | null; set_id?: string | null; quantity: number; unit_price: number }[];
}): Order {
  const id = uuid();
  const shipping_fee = data.delivery_method === '配送' ? 1500 : 0;
  const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const total = subtotal + shipping_fee;

  const o: Order = {
    id,
    reservation_id: data.reservation_id || null,
    customer_name: data.customer_name,
    phone: data.phone,
    address: data.address,
    has_box: data.has_box,
    packing_note: data.packing_note,
    scheduled_date: data.scheduled_date,
    scheduled_time: data.scheduled_time,
    delivery_method: data.delivery_method,
    shipping_fee,
    payment_method: data.payment_method,
    subtotal,
    total,
    status: data.status,
    created_at: now(),
    updated_at: now(),
  };
  orders.push(o);

  for (const item of data.items) {
    orderItems.push({
      id: uuid(),
      order_id: id,
      variety_id: item.variety_id || null,
      set_id: item.set_id || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
    });
  }

  recalcReserved();
  return getOrder(id)!;
}

export function updateOrder(id: string, data: Partial<{
  customer_name: string;
  phone: string;
  address: string;
  has_box: boolean;
  packing_note: string;
  scheduled_date: string;
  scheduled_time: string;
  delivery_method: '配送' | '配達' | '店頭受取';
  payment_method: '現金' | 'PayPay' | '未収';
  status: '確定' | '準備中' | '配達予定' | '完了' | 'キャンセル';
}>): Order | null {
  const o = orders.find(o => o.id === id);
  if (!o) return null;
  Object.assign(o, data, { updated_at: now() });
  if (data.delivery_method) {
    o.shipping_fee = data.delivery_method === '配送' ? 1500 : 0;
    o.total = o.subtotal + o.shipping_fee;
  }
  recalcReserved();
  return getOrder(id)!;
}

export function deleteOrder(id: string): boolean {
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return false;
  orders.splice(idx, 1);
  orderItems = orderItems.filter(oi => oi.order_id !== id);
  recalcReserved();
  return true;
}

// --- カレンダー用 ---
export function getOrdersByDate(date: string): Order[] {
  return getOrders().filter(o => o.scheduled_date === date && o.status !== 'キャンセル');
}

// --- ダッシュボード用 ---
export function getUnpaidOrders(): Order[] {
  return getOrders().filter(o => o.payment_method === '未収' && o.status !== 'キャンセル' && o.status !== '完了');
}
