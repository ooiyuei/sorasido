# ソラしどファーム 予約・注文管理システム

ぶどう農場「ソラしどファーム」の予約・注文・在庫・配達スケジュールを一元管理するWebアプリ。

## 機能

- **品種管理** — 品種ごとの単価・想定出荷数・予約確保数・残数を自動計算、在庫状態表示
- **セット商品管理** — 複数品種を組み合わせたセット商品、固定価格/構成合計の選択
- **予約管理** — LINEや口頭で入る予約を一元管理、担当者割当、ステータス管理
- **注文管理** — 単品/セットの注文登録、送料自動計算、支払い状態管理、担当者・配達スタッフ割当
- **在庫自動反映** — 注文確定時に品種ごとの在庫を自動で減算
- **配達カレンダー** — 月カレンダーで配達スケジュールを可視化、日別配達リスト
- **Google Maps連携** — 住所からマップ表示・ルート案内をワンクリック
- **Google Calendar連携** — 注文・配達情報をGoogleカレンダーにワンクリック追加
- **担当者管理** — スタッフごとのカラー表示、担当者別フィルタリング
- **簡易パスワード保護** — 公開URLへのアクセス制限

## データ構造

### staff（スタッフ）
id, name, role(オーナー/スタッフ/配達), color, phone, is_active

### varieties（品種）
id, name, expected_quantity, reserved_quantity(自動計算), unit_price, low_stock_threshold, is_active

### sets（セット商品）
id, name, price, pricing_mode(fixed/derived), is_active → set_items(variety_id, quantity)

### reservations（予約）
id, customer_name, phone, address, desired_date, desired_time, delivery_method, items_note, memo, status, assignee_id

### orders（注文）
id, reservation_id, customer_name, phone, address, has_box, packing_note, scheduled_date, scheduled_time, delivery_method, shipping_fee, payment_method, payment_status, subtotal, total, status, assignee_id, delivery_staff_id, google_calendar_event_id

### order_items（注文明細）
id, order_id, variety_id, set_id, quantity, unit_price_snapshot, line_total

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase（DB・認証）

## セットアップ

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | △ | SupabaseプロジェクトURL（未設定でもダミーデータで動作） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | △ | Supabase匿名キー |
| `NEXT_PUBLIC_SITE_PASSWORD` | △ | 簡易パスワード保護（未設定=保護なし） |

## Vercelデプロイ

1. GitHubにリポジトリをpush
2. [Vercel](https://vercel.com) でリポジトリをインポート
3. Environment Variables に上記3つを設定
4. Deploy

## Supabase接続

1. [Supabase](https://supabase.com) でプロジェクト作成
2. SQL Editor で `supabase/schema.sql` を実行
3. （任意）`supabase/seed.sql` でサンプルデータ投入
4. Settings > API から URL と anon key を環境変数に設定

## TODO

- [ ] Supabase本接続（現在はインメモリストア）
- [ ] Supabase Auth による認証（現在は簡易パスワード）
- [ ] 予約→注文変換時のデータプリフィル
- [ ] LINE連携（Messaging API）
- [ ] Googleカレンダー双方向同期（現在はワンクリック追加のみ）
- [ ] 印刷用配達リスト
- [ ] スタッフ管理画面（現在はダミーデータ）
