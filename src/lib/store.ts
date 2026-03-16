/**
 * ローカルインメモリストア
 * Supabase接続前のMVP用。接続後はsupabaseクライアントに置き換える。
 * TODO: Supabase接続時にこのファイルを supabase クエリに置き換える
 */

import { Customer, Variety, ProductSet, SetItem, Reception, ReceptionItem } from '@/types';
import { v4 as uuid } from 'uuid';

// --- 初期データ ---

const initialCustomers: Customer[] = [
  { id: 'c1', name: '田中太郎', phone: '090-1234-5678', address: '岡山県岡山市北区1-1-1', memo: '', created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'c2', name: '佐藤一郎', phone: '070-1111-2222', address: '東京都渋谷区3-3-3', memo: '', created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'c3', name: '鈴木次郎', phone: '090-3333-4444', address: '', memo: '', created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'c4', name: '山本花子', phone: '080-9876-5432', address: '岡山県倉敷市2-2-2', memo: '', created_at: '2026-01-01', updated_at: '2026-01-01' },
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

const initialReceptionItems: ReceptionItem[] = [
  { id: 'ri1', reception_id: 'rec1', variety_id: null, set_id: 's1', quantity: 2, unit_price_snapshot: 2500, line_total: 5000 },
  { id: 'ri2', reception_id: 'rec2', variety_id: null, set_id: 's2', quantity: 1, unit_price_snapshot: 4000, line_total: 4000 },
  { id: 'ri3', reception_id: 'rec3', variety_id: 'v1', set_id: null, quantity: 2, unit_price_snapshot: 1500, line_total: 3000 },
  { id: 'ri4', reception_id: 'rec3', variety_id: 'v2', set_id: null, quantity: 1, unit_price_snapshot: 1200, line_total: 1200 },
];

const initialReceptions: Reception[] = [
  { id: 'rec1', customer_id: 'c1', customer_name: '田中太郎', phone: '090-1234-5678', address: '岡山県岡山市北区1-1-1', desired_date: '2026-08-10', desired_time: '午前', delivery_method: '配達', items_note: 'お盆セット×2', has_box: true, packing_note: '2箱に分ける', shipping_fee: 0, payment_method: '現金', payment_status: '支払済', subtotal: 5000, total: 5000, status: '注文確定', memo: 'お盆用、のし付き希望', google_calendar_event_id: null, created_at: '2026-03-01', updated_at: '2026-03-01' },
  { id: 'rec2', customer_id: 'c2', customer_name: '佐藤一郎', phone: '070-1111-2222', address: '東京都渋谷区3-3-3', desired_date: '2026-08-12', desired_time: '指定なし', delivery_method: '配送', items_note: 'プレミアムセット', has_box: true, packing_note: '', shipping_fee: 1500, payment_method: 'PayPay', payment_status: '支払済', subtotal: 4000, total: 5500, status: '準備中', memo: '', google_calendar_event_id: null, created_at: '2026-03-02', updated_at: '2026-03-02' },
  { id: 'rec3', customer_id: 'c3', customer_name: '鈴木次郎', phone: '090-3333-4444', address: '', desired_date: '2026-08-10', desired_time: '10:00', delivery_method: '店頭受取', items_note: '単品', has_box: false, packing_note: '', shipping_fee: 0, payment_method: '未収', payment_status: '未払い', subtotal: 4200, total: 4200, status: '注文確定', memo: '', google_calendar_event_id: null, created_at: '2026-03-03', updated_at: '2026-03-03' },
  { id: 'rec4', customer_id: 'c4', customer_name: '山本花子', phone: '080-9876-5432', address: '岡山県倉敷市2-2-2', desired_date: '', desired_time: '', delivery_method: '配送', items_note: 'シャインマスカット3房', has_box: false, packing_note: '', shipping_fee: 0, payment_method: '現金', payment_status: '未払い', subtotal: 0, total: 0, status: '相談中', memo: '', google_calendar_event_id: null, created_at: '2026-03-05', updated_at: '2026-03-05' },
];

// --- ストア ---
let customers = [...initialCustomers];
let varieties = [...initialVarieties];
let sets = initialSets.map(s => ({ ...s }));
let setItems = [...initialSetItems];
let receptions = initialReceptions.map(r => ({ ...r }));
let receptionItems = [...initialReceptionItems];

function recalcReserved() {
  for (const v of varieties) {
    let total = 0;
    for (const r of receptions) {
      if (r.status === 'キャンセル') continue;
      const items = receptionItems.filter(ri => ri.reception_id === r.id);
      for (const ri of items) {
        if (ri.variety_id === v.id) total += ri.quantity;
        if (ri.set_id) {
          const sis = setItems.filter(si => si.set_id === ri.set_id && si.variety_id === v.id);
          for (const si of sis) total += ri.quantity * si.quantity;
        }
      }
    }
    v.reserved_quantity = total;
  }
}
recalcReserved();

const now = () => new Date().toISOString();

// --- Customer CRUD ---
export function getCustomers(): Customer[] { return customers.map(c => ({ ...c })); }
export function getCustomer(id: string): Customer | undefined { return customers.find(c => c.id === id); }
export function createCustomer(data: { name: string; phone: string; address?: string; memo?: string }): Customer {
  const c: Customer = { id: uuid(), name: data.name, phone: data.phone, address: data.address || '', memo: data.memo || '', created_at: now(), updated_at: now() };
  customers.push(c);
  return { ...c };
}
export function updateCustomer(id: string, data: Partial<Pick<Customer, 'name' | 'phone' | 'address' | 'memo'>>): Customer | null {
  const c = customers.find(c => c.id === id); if (!c) return null;
  Object.assign(c, data, { updated_at: now() });
  return { ...c };
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

// --- Receptions CRUD ---
function enrichReception(r: Reception): Reception {
  return {
    ...r,
    customer: customers.find(c => c.id === r.customer_id),
    items: receptionItems.filter(ri => ri.reception_id === r.id).map(ri => ({
      ...ri,
      variety: ri.variety_id ? varieties.find(v => v.id === ri.variety_id) : undefined,
      set: ri.set_id ? getSet(ri.set_id) : undefined,
    })),
  };
}

export function getReceptions(): Reception[] { return receptions.map(enrichReception); }
export function getReception(id: string): Reception | undefined {
  const r = receptions.find(r => r.id === id); if (!r) return undefined;
  return enrichReception(r);
}

export function createReception(data: {
  customer_id?: string;
  customer_name: string;
  phone: string;
  address?: string;
  desired_date?: string;
  desired_time?: string;
  delivery_method: '配送' | '配達' | '店頭受取';
  items_note?: string;
  has_box?: boolean;
  packing_note?: string;
  payment_method: '現金' | 'PayPay' | '未収';
  payment_status?: '未払い' | '支払済';
  status: '相談中' | '仮予約' | '注文確定' | '準備中' | '受渡し待ち' | '完了' | 'キャンセル';
  memo?: string;
  items?: { variety_id?: string | null; set_id?: string | null; quantity: number; unit_price_snapshot: number }[];
}): Reception {
  // Auto-create or find customer
  let customerId = data.customer_id;
  if (!customerId) {
    const existing = customers.find(c => c.name === data.customer_name && c.phone === data.phone);
    if (existing) {
      customerId = existing.id;
    } else {
      const newCustomer = createCustomer({ name: data.customer_name, phone: data.phone, address: data.address || '' });
      customerId = newCustomer.id;
    }
  }

  const id = uuid();
  const shipping_fee = data.delivery_method === '配送' ? 1500 : 0;
  const items = data.items || [];
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price_snapshot, 0);
  const total = subtotal + shipping_fee;
  const payment_status = data.payment_status || (data.payment_method === '未収' ? '未払い' : '支払済');

  const r: Reception = {
    id,
    customer_id: customerId,
    customer_name: data.customer_name,
    phone: data.phone,
    address: data.address || '',
    desired_date: data.desired_date || '',
    desired_time: data.desired_time || '',
    delivery_method: data.delivery_method,
    items_note: data.items_note || '',
    has_box: data.has_box || false,
    packing_note: data.packing_note || '',
    shipping_fee,
    payment_method: data.payment_method,
    payment_status,
    subtotal,
    total,
    status: data.status,
    memo: data.memo || '',
    google_calendar_event_id: null,
    created_at: now(),
    updated_at: now(),
  };
  receptions.push(r);

  for (const item of items) {
    const line_total = item.quantity * item.unit_price_snapshot;
    receptionItems.push({
      id: uuid(),
      reception_id: id,
      variety_id: item.variety_id || null,
      set_id: item.set_id || null,
      quantity: item.quantity,
      unit_price_snapshot: item.unit_price_snapshot,
      line_total,
    });
  }

  recalcReserved();
  return getReception(id)!;
}

export function updateReception(id: string, data: Partial<{
  customer_name: string;
  phone: string;
  address: string;
  desired_date: string;
  desired_time: string;
  delivery_method: '配送' | '配達' | '店頭受取';
  items_note: string;
  has_box: boolean;
  packing_note: string;
  payment_method: '現金' | 'PayPay' | '未収';
  payment_status: '未払い' | '支払済';
  status: '相談中' | '仮予約' | '注文確定' | '準備中' | '受渡し待ち' | '完了' | 'キャンセル';
  memo: string;
  google_calendar_event_id: string | null;
}>): Reception | null {
  const r = receptions.find(r => r.id === id); if (!r) return null;
  Object.assign(r, data, { updated_at: now() });
  if (data.delivery_method) {
    r.shipping_fee = data.delivery_method === '配送' ? 1500 : 0;
    r.total = r.subtotal + r.shipping_fee;
  }
  recalcReserved();
  return getReception(id)!;
}

export function deleteReception(id: string): boolean {
  const idx = receptions.findIndex(r => r.id === id); if (idx === -1) return false;
  receptions.splice(idx, 1);
  receptionItems = receptionItems.filter(ri => ri.reception_id !== id);
  recalcReserved();
  return true;
}
