-- ソラしどファーム 予約・注文管理システム
-- Supabase用スキーマ定義

-- 品種マスタ
CREATE TABLE varieties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  expected_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- セット商品
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- セット構成品種
CREATE TABLE set_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
  variety_id UUID NOT NULL REFERENCES varieties(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- 予約
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  desired_date DATE,
  desired_time TEXT NOT NULL DEFAULT '',
  delivery_method TEXT NOT NULL DEFAULT '配達' CHECK (delivery_method IN ('配送', '配達', '店頭受取')),
  items_note TEXT NOT NULL DEFAULT '',
  memo TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '仮予約' CHECK (status IN ('仮予約', '確定', 'キャンセル')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 注文
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  has_box BOOLEAN NOT NULL DEFAULT false,
  packing_note TEXT NOT NULL DEFAULT '',
  scheduled_date DATE,
  scheduled_time TEXT NOT NULL DEFAULT '',
  delivery_method TEXT NOT NULL DEFAULT '配達' CHECK (delivery_method IN ('配送', '配達', '店頭受取')),
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT '現金' CHECK (payment_method IN ('現金', 'PayPay', '未収')),
  subtotal INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT '確定' CHECK (status IN ('確定', '準備中', '配達予定', '完了', 'キャンセル')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 注文明細
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variety_id UUID REFERENCES varieties(id) ON DELETE RESTRICT,
  set_id UUID REFERENCES sets(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  CHECK (variety_id IS NOT NULL OR set_id IS NOT NULL)
);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER varieties_updated_at BEFORE UPDATE ON varieties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER sets_updated_at BEFORE UPDATE ON sets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 在庫自動計算: 注文確定時に品種のreserved_quantityを再計算するFunction
CREATE OR REPLACE FUNCTION recalculate_reserved_quantity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE varieties v
  SET reserved_quantity = COALESCE((
    SELECT SUM(
      CASE
        WHEN oi.variety_id IS NOT NULL THEN oi.quantity
        WHEN oi.set_id IS NOT NULL THEN oi.quantity * COALESCE(si.quantity, 0)
        ELSE 0
      END
    )
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    LEFT JOIN set_items si ON si.set_id = oi.set_id AND si.variety_id = v.id
    WHERE o.status NOT IN ('キャンセル')
      AND (oi.variety_id = v.id OR si.variety_id = v.id)
  ), 0);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_items_recalc AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH STATEMENT EXECUTE FUNCTION recalculate_reserved_quantity();

CREATE TRIGGER orders_status_recalc AFTER UPDATE OF status ON orders
FOR EACH STATEMENT EXECUTE FUNCTION recalculate_reserved_quantity();

-- インデックス
CREATE INDEX idx_orders_scheduled_date ON orders(scheduled_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_set_items_set_id ON set_items(set_id);
