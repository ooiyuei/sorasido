/**
 * ローカルインメモリストア v4
 * グラム単価対応・顧客連携強化・アーカイブベース削除・売上記録
 */

import { Customer, Variety, ProductSet, SetItem, Reception, ReceptionItem, SalesRecord } from '@/types';
import { v4 as uuid } from 'uuid';

const now = () => new Date().toISOString();

// --- 初期データ ---

const initialCustomers: Customer[] = [
  { id: 'c1', name: '田中太郎', phone: '090-1234-5678', address: '岡山県岡山市北区1-1-1', line_name: '', memo: 'のし付き希望', last_delivery_method: '配達', frequent_items: 'お盆セット', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'c2', name: '佐藤一郎', phone: '070-1111-2222', address: '東京都渋谷区3-3-3', line_name: 'sato_ichiro', memo: '', last_delivery_method: '配送', frequent_items: 'プレミアムセット', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'c3', name: '鈴木次郎', phone: '090-3333-4444', address: '', line_name: '', memo: '', last_delivery_method: '店頭受取', frequent_items: 'シャインマスカット, ゴルビー', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'c4', name: '山本花子', phone: '080-9876-5432', address: '岡山県倉敷市2-2-2', line_name: 'hanako_y', memo: '', last_delivery_method: '配送', frequent_items: 'シャインマスカット', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
];

const initialVarieties: Variety[] = [
  { id: 'v1', name: 'シャインマスカット', expected_quantity: 100, reserved_quantity: 0, pricing_type: 'by_weight', price_per_100g: 300, unit_price: 1500, box_fee: 300, low_stock_threshold: 10, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v2', name: 'ゴルビー', expected_quantity: 80, reserved_quantity: 0, pricing_type: 'by_weight', price_per_100g: 250, unit_price: 1200, box_fee: 300, low_stock_threshold: 10, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v3', name: 'BKシードレス', expected_quantity: 60, reserved_quantity: 0, pricing_type: 'by_weight', price_per_100g: 200, unit_price: 1000, box_fee: 300, low_stock_threshold: 5, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v4', name: 'ピオーネ', expected_quantity: 50, reserved_quantity: 0, pricing_type: 'by_weight', price_per_100g: 180, unit_price: 800, box_fee: 300, low_stock_threshold: 5, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'v5', name: '巨峰', expected_quantity: 70, reserved_quantity: 0, pricing_type: 'by_weight', price_per_100g: 150, unit_price: 700, box_fee: 300, low_stock_threshold: 10, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
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
  { id: 'ri1', reception_id: 'rec1', variety_id: null, set_id: 's1', quantity: 2, planned_quantity_text: 'お盆セット×2', actual_weight_g: null, unit_price_snapshot: 2500, line_total: 5000 },
  { id: 'ri2', reception_id: 'rec2', variety_id: null, set_id: 's2', quantity: 1, planned_quantity_text: 'プレミアムセット×1', actual_weight_g: null, unit_price_snapshot: 4000, line_total: 4000 },
  { id: 'ri3', reception_id: 'rec3', variety_id: 'v1', set_id: null, quantity: 2, planned_quantity_text: 'シャインマスカット 2房くらい', actual_weight_g: null, unit_price_snapshot: 1500, line_total: 3000 },
  { id: 'ri4', reception_id: 'rec3', variety_id: 'v2', set_id: null, quantity: 1, planned_quantity_text: 'ゴルビー 1房', actual_weight_g: null, unit_price_snapshot: 1200, line_total: 1200 },
];

const initialReceptions: Reception[] = [
  { id: 'rec1', customer_id: 'c1', customer_name_snapshot: '田中太郎', customer_phone_snapshot: '090-1234-5678', customer_address_snapshot: '岡山県岡山市北区1-1-1', desired_date: '2026-08-10', desired_time: '午前', delivery_method: '配達', items_note: 'お盆セット×2', has_box: true, box_count: 2, packing_note: '2箱に分ける', shipping_fee: 0, discount: 0, payment_method: '現金', payment_status: '支払済', subtotal: 5000, total: 5000, status: '受付済み', date_confirmed: true, weighed: false, delivered: false, memo: 'のし付き希望', is_archived: false, created_at: '2026-03-01', updated_at: '2026-03-01' },
  { id: 'rec2', customer_id: 'c2', customer_name_snapshot: '佐藤一郎', customer_phone_snapshot: '070-1111-2222', customer_address_snapshot: '東京都渋谷区3-3-3', desired_date: '2026-08-12', desired_time: '指定なし', delivery_method: '配送', items_note: 'プレミアムセット', has_box: true, box_count: 1, packing_note: '', shipping_fee: 1500, discount: 0, payment_method: 'PayPay', payment_status: '支払済', subtotal: 4000, total: 5500, status: '受付済み', date_confirmed: true, weighed: false, delivered: false, memo: '', is_archived: false, created_at: '2026-03-02', updated_at: '2026-03-02' },
  { id: 'rec3', customer_id: 'c3', customer_name_snapshot: '鈴木次郎', customer_phone_snapshot: '090-3333-4444', customer_address_snapshot: '', desired_date: '2026-08-10', desired_time: '10:00', delivery_method: '店頭受取', items_note: 'シャインマスカット2房+ゴルビー1房', has_box: false, box_count: 0, packing_note: '', shipping_fee: 0, discount: 0, payment_method: '未定', payment_status: '未払い', subtotal: 4200, total: 4200, status: '会計待ち', date_confirmed: true, weighed: false, delivered: false, memo: '', is_archived: false, created_at: '2026-03-03', updated_at: '2026-03-03' },
  { id: 'rec4', customer_id: 'c4', customer_name_snapshot: '山本花子', customer_phone_snapshot: '080-9876-5432', customer_address_snapshot: '岡山県倉敷市2-2-2', desired_date: '', desired_time: '', delivery_method: '配送', items_note: 'シャインマスカット3房', has_box: false, box_count: 0, packing_note: '', shipping_fee: 0, discount: 0, payment_method: '未定', payment_status: '未払い', subtotal: 0, total: 0, status: '相談中', date_confirmed: false, weighed: false, delivered: false, memo: '', is_archived: false, created_at: '2026-03-05', updated_at: '2026-03-05' },
];

// --- ストア ---
let customers = initialCustomers.map(c => ({ ...c }));
let varieties = initialVarieties.map(v => ({ ...v }));
let sets = initialSets.map(s => ({ ...s }));
let setItems = [...initialSetItems];
let receptions = initialReceptions.map(r => ({ ...r }));
let receptionItems = initialReceptionItems.map(ri => ({ ...ri }));
let salesRecords: SalesRecord[] = [];

function recalcReserved() {
  for (const v of varieties) {
    let total = 0;
    for (const r of receptions) {
      if (r.status === 'キャンセル' || r.is_archived) continue;
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

// --- Customer CRUD ---
export function getCustomers(): Customer[] { return customers.filter(c => c.is_active).map(c => ({ ...c })); }
export function getAllCustomers(): Customer[] { return customers.map(c => ({ ...c })); }
export function getCustomer(id: string): Customer | undefined { return customers.find(c => c.id === id); }
export function searchCustomers(query: string): Customer[] {
  if (!query) return getCustomers();
  const q = query.toLowerCase();
  return customers.filter(c => c.is_active && (
    c.name.toLowerCase().includes(q) ||
    c.phone.includes(q) ||
    c.address.toLowerCase().includes(q) ||
    c.line_name.toLowerCase().includes(q)
  )).map(c => ({ ...c }));
}
export function createCustomer(data: { name: string; phone: string; address?: string; line_name?: string; memo?: string; last_delivery_method?: string; frequent_items?: string }): Customer {
  const c: Customer = {
    id: uuid(), name: data.name, phone: data.phone, address: data.address || '', line_name: data.line_name || '',
    memo: data.memo || '', last_delivery_method: (data.last_delivery_method as Customer['last_delivery_method']) || '',
    frequent_items: data.frequent_items || '', is_active: true, created_at: now(), updated_at: now()
  };
  customers.push(c);
  return { ...c };
}
export function updateCustomer(id: string, data: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>): Customer | null {
  const c = customers.find(c => c.id === id); if (!c) return null;
  Object.assign(c, data, { updated_at: now() });
  return { ...c };
}
export function archiveCustomer(id: string): boolean {
  const c = customers.find(c => c.id === id); if (!c) return false;
  c.is_active = false;
  c.updated_at = now();
  // Archive related receptions too
  for (const r of receptions) {
    if (r.customer_id === id && !r.is_archived) {
      r.is_archived = true;
      r.updated_at = now();
    }
  }
  recalcReserved();
  return true;
}

// --- Varieties CRUD ---
export function getVarieties(): Variety[] { return varieties.filter(v => v.is_active).map(v => ({ ...v })); }
export function getVariety(id: string): Variety | undefined { return varieties.find(v => v.id === id); }
export function createVariety(data: { name: string; expected_quantity: number; pricing_type?: string; price_per_100g?: number; unit_price?: number; box_fee?: number; low_stock_threshold?: number }): Variety {
  const v: Variety = {
    id: uuid(), name: data.name, expected_quantity: data.expected_quantity,
    pricing_type: (data.pricing_type as Variety['pricing_type']) || 'by_weight',
    price_per_100g: data.price_per_100g || 0, unit_price: data.unit_price || 0,
    box_fee: data.box_fee || 0, low_stock_threshold: data.low_stock_threshold || 10,
    is_active: true, reserved_quantity: 0, created_at: now(), updated_at: now()
  };
  varieties.push(v); return v;
}
export function updateVariety(id: string, data: Partial<Pick<Variety, 'name' | 'expected_quantity' | 'pricing_type' | 'price_per_100g' | 'unit_price' | 'box_fee' | 'low_stock_threshold' | 'is_active'>>): Variety | null {
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

export function getReceptions(): Reception[] {
  return receptions.filter(r => !r.is_archived).map(enrichReception);
}
export function getReception(id: string): Reception | undefined {
  const r = receptions.find(r => r.id === id); if (!r) return undefined;
  return enrichReception(r);
}

export function createReception(data: {
  customer_id?: string;
  customer_name?: string;
  phone?: string;
  address?: string;
  desired_date?: string;
  desired_time?: string;
  delivery_method?: string;
  items_note?: string;
  has_box?: boolean;
  box_count?: number;
  packing_note?: string;
  payment_method?: string;
  status?: string;
  memo?: string;
  items?: { variety_id?: string | null; set_id?: string | null; quantity: number; planned_quantity_text?: string; unit_price_snapshot: number }[];
}): Reception {
  // Resolve customer
  let customerId = data.customer_id || '';
  let customerName = data.customer_name || '';
  let customerPhone = data.phone || '';
  let customerAddress = data.address || '';

  if (customerId) {
    const c = customers.find(c => c.id === customerId);
    if (c) {
      customerName = customerName || c.name;
      customerPhone = customerPhone || c.phone;
      customerAddress = customerAddress || c.address;
      // Update last_delivery_method
      if (data.delivery_method) {
        c.last_delivery_method = data.delivery_method as Customer['last_delivery_method'];
        c.updated_at = now();
      }
    }
  } else if (customerName) {
    const existing = customers.find(c => c.is_active && c.name === customerName && c.phone === customerPhone);
    if (existing) {
      customerId = existing.id;
    } else {
      const newC = createCustomer({ name: customerName, phone: customerPhone, address: customerAddress });
      customerId = newC.id;
    }
  }

  const id = uuid();
  const dm = (data.delivery_method || '配達') as Reception['delivery_method'];
  const shipping_fee = dm === '配送' ? 1500 : 0;
  const items = data.items || [];
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price_snapshot, 0);
  const total = subtotal + shipping_fee;

  const r: Reception = {
    id,
    customer_id: customerId,
    customer_name_snapshot: customerName,
    customer_phone_snapshot: customerPhone,
    customer_address_snapshot: customerAddress,
    desired_date: data.desired_date || '',
    desired_time: data.desired_time || '',
    delivery_method: dm,
    items_note: data.items_note || '',
    has_box: data.has_box || false,
    box_count: data.box_count || 0,
    packing_note: data.packing_note || '',
    shipping_fee,
    discount: 0,
    payment_method: (data.payment_method || '未定') as Reception['payment_method'],
    payment_status: '未払い',
    subtotal,
    total,
    status: (data.status || '相談中') as Reception['status'],
    date_confirmed: !!data.desired_date,
    weighed: false,
    delivered: false,
    memo: data.memo || '',
    is_archived: false,
    created_at: now(),
    updated_at: now(),
  };
  receptions.push(r);

  for (const item of items) {
    receptionItems.push({
      id: uuid(),
      reception_id: id,
      variety_id: item.variety_id || null,
      set_id: item.set_id || null,
      quantity: item.quantity,
      planned_quantity_text: item.planned_quantity_text || '',
      actual_weight_g: null,
      unit_price_snapshot: item.unit_price_snapshot,
      line_total: item.quantity * item.unit_price_snapshot,
    });
  }

  recalcReserved();
  return getReception(id)!;
}

export function updateReception(id: string, data: Record<string, unknown>): Reception | null {
  const r = receptions.find(r => r.id === id); if (!r) return null;

  const { items: newItems, ...rest } = data as { items?: { variety_id?: string | null; set_id?: string | null; quantity: number; planned_quantity_text?: string; actual_weight_g?: number | null; unit_price_snapshot: number }[]; [key: string]: unknown };

  // Apply simple fields
  const allowedFields = [
    'customer_name_snapshot', 'customer_phone_snapshot', 'customer_address_snapshot',
    'desired_date', 'desired_time', 'delivery_method', 'items_note', 'has_box', 'box_count',
    'packing_note', 'shipping_fee', 'discount', 'payment_method', 'payment_status',
    'status', 'date_confirmed', 'weighed', 'delivered', 'memo', 'is_archived'
  ];
  for (const key of allowedFields) {
    if (rest[key] !== undefined) (r as Record<string, unknown>)[key] = rest[key];
  }
  r.updated_at = now();

  if (rest.delivery_method !== undefined) {
    r.shipping_fee = r.delivery_method === '配送' ? 1500 : 0;
  }
  if (rest.desired_date !== undefined) {
    r.date_confirmed = !!r.desired_date;
  }

  if (newItems !== undefined) {
    receptionItems = receptionItems.filter(ri => ri.reception_id !== id);
    for (const item of newItems) {
      receptionItems.push({
        id: uuid(),
        reception_id: id,
        variety_id: item.variety_id || null,
        set_id: item.set_id || null,
        quantity: item.quantity,
        planned_quantity_text: item.planned_quantity_text || '',
        actual_weight_g: item.actual_weight_g ?? null,
        unit_price_snapshot: item.unit_price_snapshot,
        line_total: item.actual_weight_g
          ? Math.round(item.actual_weight_g / 100 * item.unit_price_snapshot)
          : item.quantity * item.unit_price_snapshot,
      });
    }
    r.subtotal = receptionItems
      .filter(ri => ri.reception_id === id)
      .reduce((sum, ri) => sum + ri.line_total, 0);
  }

  r.total = r.subtotal + r.shipping_fee - r.discount;
  if (r.total < 0) r.total = 0;

  // Update customer last_delivery_method
  if (rest.delivery_method && r.customer_id) {
    const c = customers.find(c => c.id === r.customer_id);
    if (c) { c.last_delivery_method = r.delivery_method; c.updated_at = now(); }
  }

  recalcReserved();
  return getReception(id)!;
}

export function archiveReception(id: string): boolean {
  const r = receptions.find(r => r.id === id); if (!r) return false;
  r.is_archived = true;
  r.updated_at = now();
  recalcReserved();
  return true;
}

export function deleteReception(id: string): boolean {
  return archiveReception(id);
}

// --- Accounting (計量・会計) ---
export function settleReception(id: string, data: {
  items: { id: string; actual_weight_g: number | null; unit_price_snapshot: number }[];
  shipping_fee: number;
  box_fee: number;
  discount: number;
  payment_method: string;
}): Reception | null {
  const r = receptions.find(r => r.id === id); if (!r) return null;

  // Update each item's actual weight and recalc line_total
  for (const update of data.items) {
    const ri = receptionItems.find(x => x.id === update.id);
    if (ri) {
      ri.actual_weight_g = update.actual_weight_g;
      ri.unit_price_snapshot = update.unit_price_snapshot;
      if (update.actual_weight_g) {
        ri.line_total = Math.round(update.actual_weight_g / 100 * update.unit_price_snapshot);
      } else {
        ri.line_total = ri.quantity * ri.unit_price_snapshot;
      }
    }
  }

  r.subtotal = receptionItems.filter(ri => ri.reception_id === id).reduce((sum, ri) => sum + ri.line_total, 0) + data.box_fee;
  r.shipping_fee = data.shipping_fee;
  r.discount = data.discount;
  r.total = r.subtotal + r.shipping_fee - r.discount;
  if (r.total < 0) r.total = 0;
  r.payment_method = data.payment_method as Reception['payment_method'];
  r.payment_status = '支払済';
  r.weighed = true;
  r.status = '完了';
  r.delivered = true;
  r.updated_at = now();

  // Create sales record
  const sr: SalesRecord = {
    id: uuid(),
    reception_id: id,
    customer_name: r.customer_name_snapshot,
    date: r.desired_date || now().split('T')[0],
    subtotal: r.subtotal,
    shipping_fee: r.shipping_fee,
    discount: r.discount,
    total: r.total,
    payment_method: r.payment_method,
    created_at: now(),
  };
  salesRecords.push(sr);

  recalcReserved();
  return getReception(id)!;
}

// --- Sales Records ---
export function getSalesRecords(): SalesRecord[] { return salesRecords.map(s => ({ ...s })); }
export function getSalesRecordsByDate(date: string): SalesRecord[] { return salesRecords.filter(s => s.date === date).map(s => ({ ...s })); }
export function getSalesRecordsByMonth(yearMonth: string): SalesRecord[] {
  return salesRecords.filter(s => s.date.startsWith(yearMonth)).map(s => ({ ...s }));
}
