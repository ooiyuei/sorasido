# ソラしどファーム 予約・注文管理システム

ぶどう農場「ソラしどファーム」の予約・注文・在庫・配達スケジュールを一元管理するWebアプリ。

## 機能

- **品種管理** — 品種ごとの想定出荷数・予約確保数・残数を自動計算
- **セット商品管理** — 複数品種を組み合わせたセット商品の作成・有効/無効切替
- **予約管理** — LINEや口頭で入る予約を一元管理、ステータス管理
- **注文管理** — 単品/セットの注文登録、送料自動計算、支払い管理
- **在庫自動反映** — 注文確定時に品種ごとの在庫を自動で減算
- **配達カレンダー** — 月カレンダーで配達スケジュールを可視化、Googleマップ連携

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase（DB・認証）

## セットアップ

### 1. 依存インストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

以下を設定:

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | △ | SupabaseプロジェクトURL（未設定でもダミーデータで動作） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | △ | Supabase匿名キー |
| `NEXT_PUBLIC_SITE_PASSWORD` | △ | 簡易パスワード保護（未設定=保護なし） |

### 3. ローカル開発

```bash
npm run dev
```

http://localhost:3000 でアクセス。

### 4. Supabase接続（本番）

1. [Supabase](https://supabase.com) でプロジェクト作成
2. SQL Editor で `supabase/schema.sql` を実行
3. （任意）`supabase/seed.sql` でサンプルデータ投入
4. Settings > API から URL と anon key を `.env.local` に設定

### 5. Vercelデプロイ

1. GitHubにリポジトリをpush
2. [Vercel](https://vercel.com) でリポジトリをインポート
3. Environment Variables に以下を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_PASSWORD`（公開前に必ず設定）
4. Deploy

## 現在の状態（MVP）

### 動作中
- 全画面のCRUD
- インメモリデータストア（ダミーデータ付き）
- 在庫自動計算ロジック
- 簡易パスワード保護
- レスポンシブUI（PC + スマホ）

### TODO
- [ ] Supabase本接続（現在はインメモリストア）
- [ ] Supabase Auth による認証
- [ ] 予約→注文変換時のデータプリフィル
- [ ] LINE連携（Messaging API）
- [ ] Googleカレンダー連携
- [ ] 品種マスタに単価フィールド追加
- [ ] 印刷用配達リスト
