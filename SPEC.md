# Personal OS — 仕様書

## 概要

個人用ライフ管理ダッシュボード。Oura Ring のヘルスデータを中心に、タスク・日記・習慣・目標・カレンダー・図書館などを一元管理する Web アプリ。

- **URL**: https://personalos-a01.pages.dev
- **対象**: 単一ユーザー（オーナーのみ使用）
- **対応端末**: Desktop 優先、iPad 対応、iPhone 後回し

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| Frontend | 単一 HTML ファイル (`PersonalOS.html`) — フレームワークなし、Vanilla JS |
| Hosting | Cloudflare Pages (`personalos-a01.pages.dev`) |
| Backend | Cloudflare Workers (`muddy-boat-633b.nxoxo-l-l-leo.workers.dev`) |
| DB | Cloudflare D1 (SQLite) — `personal-os-db` |
| Auth | Google OAuth 2.0 |
| Health data | Oura Ring API v2 (Personal Access Token) |
| AI | Google Gemini 2.5 Flash（ヘルスレビュー生成） |
| Font | Plus Jakarta Sans / DM Mono (Google Fonts) |

---

## ファイル構成

```
personal-os/
├── PersonalOS.html        # フロントエンド（全機能。約9400行）
├── manifest.json          # PWA マニフェスト
├── _redirects             # Cloudflare Pages リダイレクト（/ → /PersonalOS.html）
├── icon-180.png           # Apple Touch Icon
├── icon-192.png           # PWA アイコン
├── icon-512.png           # PWA アイコン（大）
└── oura-proxy/
    ├── worker.js          # Cloudflare Worker（API・認証・プロキシ）
    ├── wrangler.toml      # Worker 設定（name: muddy-boat-633b）
    └── schema.sql         # D1 スキーマ
```

---

## D1 データベーススキーマ

```sql
users        -- id, google_id, email, name, picture, created_at
sessions     -- id, user_id, created_at, expires_at  (TTL: 30日)
oauth_states -- state, created_at, expires_at        (TTL: 10分)
integrations -- user_id, service, token, refresh_token, expires_at, metadata
```

`integrations.service` の現在値: `'oura'`

---

## Worker API エンドポイント

ベース URL: `https://muddy-boat-633b.nxoxo-l-l-leo.workers.dev`

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| GET | `/auth/google` | 不要 | Google OAuth 開始 |
| GET | `/auth/google/callback` | 不要 | OAuth コールバック・セッション発行 |
| GET | `/auth/me` | 要 | 現在のセッション確認 |
| POST | `/auth/logout` | 要 | セッション削除 |
| GET | `/api/integrations` | 要 | 連携済みサービス一覧 |
| POST | `/api/integrations/oura` | 要 | Oura PAT を D1 に保存 |
| DELETE | `/api/integrations/oura` | 要 | Oura PAT を D1 から削除 |
| GET | `/api/oura/*` | 要 | Oura API プロキシ（PAT は D1 から取得） |
| POST | `/ai-review` | 不要 | Gemini でヘルスレビュー生成 |
| GET | `/*` | 不要 | レガシー Oura プロキシ（Authorization ヘッダー直渡し） |

認証: `Authorization: Bearer <session_token>`  
CORS: `Access-Control-Allow-Origin: *`（全オリジン許可）

---

## 認証フロー

### 初回セットアップ
1. アプリ起動 → ログインゲート表示（Google ステップ）
2. 「Googleでログイン」→ ポップアップで Google OAuth
3. コールバックで `pos-session` トークンを `localStorage` に保存
4. Worker が `/api/integrations` を確認 → Oura 未連携 → Oura ステップ表示
5. Oura PAT 入力 → `POST /api/integrations/oura` → D1 に保存
6. `localStorage.pos-fully-setup = '1'` を set → ゲート非表示

### 2回目以降
1. `pos-session` + `pos-fully-setup = '1'` が localStorage にある → 即アプリ表示
2. バックグラウンド検証なし（ネットワーク不要で起動）

### セッション切れ・エラー処理
| 状態 | 挙動 |
|---|---|
| `pos-session` なし | ログインゲート（Google ステップ） |
| `pos-session` あり・`pos-fully-setup` あり | 即アプリ表示 |
| Oura API → 403（D1 に PAT なし） | `pos-fully-setup` 削除 → ゲート（Oura ステップ） |
| Oura API → 401（PAT 無効） | Health 画面内エラー表示（ゲートは出さない） |
| ログアウト | `pos-session`, `pos-fully-setup` 削除 → ゲート（Google ステップ） |

### localStorage キー一覧（認証関連）
| キー | 値 | 説明 |
|---|---|---|
| `pos-session` | UUID 文字列 | Google セッショントークン |
| `pos-fully-setup` | `'1'` | Google + Oura セットアップ完了フラグ |

---

## 画面構成（ページ）

左サイドバーのアイコンで切り替え。

| ID | タイトル | 説明 |
|---|---|---|
| `home` | Personal OS | ウィジェットグリッド（ドラッグ&リサイズ可） |
| `tasks` | Tasks | タスク管理。ステータス: todo/done/wishlist/archive |
| `calendar` | Calendar | 月表示カレンダー |
| `health` | Health | Oura データダッシュボード（メイン機能） |
| `journal` | Journal | 日記・ノート・ナレッジ |
| `analytics` | Analytics | タスク分析・週次レビュー・AI レビュー |
| `notes` | Notes Board | カードボード式メモ |
| `goals` | Goals / OKR | 目標管理 |
| `routine` | Routine | ルーティンチェック |
| `log` | Manual Log | 手動ログ記録 |
| `library` | Library | ブックマーク・読書・視聴リスト |
| `settings` | Settings | Oura 連携・アカウント・ウィジェット設定 |

---

## Health 画面（Oura 連携）

### 表示モード
- **Daily**: 今日のデータ（Readiness / Sleep / Activity / HRV / ストレス）
- **Weekly**: 7日間トレンド
- **Monthly**: 30日間トレンド
- **Detail**: 詳細睡眠ステージ
- **Calibration**: Oura モデル精度キャリブレーション

### Oura API エンドポイント（使用中）
- `daily_readiness` — 回復力スコア
- `daily_sleep` — 睡眠スコア
- `sleep` — 睡眠セッション詳細（ステージ・HRV・呼吸数）
- `daily_activity` — 活動スコア・歩数
- `daily_stress` — ストレス曲線
- `workout` — ワークアウトセッション

### AI レビュー
Health データを Gemini 2.5 Flash に送信し、状態名・推奨アクション・避けること・スコア解釈を JSON で取得して表示。キャッシュあり（1日1回）。

---

## データ永続化

### Cloudflare D1（サーバー側・全端末共有）
- ユーザー情報
- セッション
- Oura PAT

### localStorage（ブラウザ側・端末ローカル）
| データ | キー |
|---|---|
| タスク | `tasks` |
| ノート | `notes` |
| 日記 | `journal` |
| ノートボード | `os-notes-board` |
| 目標 | `os-goals` |
| ルーティン設定 | `os-routine-items`, `os-routine-log` |
| 手動ログ | `os-manual-log` |
| ライブラリ | `os-library` |
| テンプレート | `os-templates` |
| ウィジェットレイアウト | `hw-layout-v4` |
| Oura キャッシュ | `oura-day-*`, `oura-week-*`, `oura-month-*` |
| AI レビューキャッシュ | `ai-review-cache-*` |

---

## ホーム画面ウィジェット

ドラッグ&リサイズ可能なグリッドレイアウト。サイズ: xs / sm / md / lg / xl

| ID | ウィジェット |
|---|---|
| `w-clock` | 時計 |
| `w-weather` | 天気 |
| `w-spotify` | Spotify |
| `w-sleep` | 睡眠スコア（Oura） |
| `w-readiness` | Readiness スコア（Oura） |
| `w-hrv` | HRV（Oura） |
| `w-study` | 学習タイマー |
| `w-pomo` | ポモドーロタイマー |
| `w-progress` | 進捗 |
| `w-tasks` | タスク一覧 |
| `w-steps` | 歩数（Oura） |
| `w-schedule` | スケジュール |

---

## PWA 設定

- `manifest.json` 設置済み
- `display: standalone`（アドレスバーなし）
- Apple Touch Icon: `icon-180.png`
- iOS Safari: `apple-mobile-web-app-capable: yes`
- ホーム画面に追加 → フルスクリーンアプリとして起動

---

## デプロイ

### フロントエンド（Cloudflare Pages）
```
npx wrangler pages deploy . --project-name personalos --commit-dirty=true
```
または GitHub (`ymgwreo/Personal-OS`) へ push → 自動デプロイ設定可

### Worker（Cloudflare Workers）
```
cd oura-proxy
npx wrangler deploy
```

### D1 マイグレーション
```
npx wrangler d1 execute personal-os-db --file=schema.sql --remote
```

---

## 環境変数（Worker secrets）

| 変数 | 説明 |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth クライアント ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth クライアントシークレット |
| `GEMINI_API_KEY` | Google Gemini API キー |

---

## 言語対応

日本語/英語 切り替え対応。`.lang-ja` クラスを body に付与で日本語表示。`.en` / `.ja` クラスを持つ要素を出し分け。

---

## 既知の制限・注意事項

- localStorage データは端末ローカルのため、複数端末間では同期されない（Oura 連携のみ D1 経由で共有）
- Oura PAT の有効期限は Oura 側の設定による
- Gemini API レート制限に注意
- `C:\Desktop\personal-os` は実際の Desktop パスとは異なる（Claude Code の作業パス）。実ファイルは別途確認が必要
