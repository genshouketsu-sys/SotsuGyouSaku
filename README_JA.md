# Speed WMS — 日本語ドキュメント

> **予測型ロジスティクスを備えた倉庫管理システム**

---

## システム概要

Speed WMS は、小〜中規模の倉庫向けのリアルタイム在庫管理システムです。

```
スマートフォン（カメラスキャン）
       ↓  HTTP POST /api/scan/push
Spring Boot バックエンド
       ↓  WebSocket 中継
PC ブラウザ（ダッシュボード）
```

**主な特徴：**
- 📱 モバイルスキャン: スマートフォンカメラで JAN バーコードを読み取り
- 📡 WebSocket リアルタイム中継: スキャン結果を即座に PC へ反映
- 📊 補充予測: 過去14日のスキャン実績から発注タイミングを算出
- 🔐 JWT 認証: Bearer トークン方式によるステートレス認証
- 🌏 多言語対応: 日本語 / 中文 / English の3言語 UI
- 📦 幂等性制御付き一括入庫処理
- 📤 Excel エクスポート機能

---

## 技術スタック

### バックエンド
| 技術 | 用途 |
|------|------|
| Java 17 + Spring Boot 3.x | アプリケーション基盤 |
| Spring Security 6.x + JWT | 認証・認可 |
| Spring WebSocket | リアルタイム通信 |
| MyBatis 3.x | O/Rマッパー |
| MySQL 8.x | メインデータベース |
| Redis 7.x | 幂等性キャッシュ |
| Apache POI 5.x | Excel 出力 |

### フロントエンド
| 技術 | 用途 |
|------|------|
| React 18.x + Vite 5.x | UI フレームワーク |
| Axios 1.x | HTTP クライアント |
| React Router 6.x | SPA ルーティング |
| html5-qrcode 2.x | バーコードスキャン |

---

## プロジェクト構成

```
SotsuGyouSaku/
├── src/main/java/com/wms/wmsbackend/
│   ├── annotation/          # @Idempotent カスタムアノテーション
│   ├── aspect/              # AOP 幂等性切面
│   ├── config/              # Bean 設定・WebSocket 設定
│   │   ├── AppConfig.java       # RestTemplate / ObjectMapper Bean
│   │   ├── ScanWebSocketHandler.java
│   │   └── WebSocketConfig.java
│   ├── controller/          # REST エンドポイント
│   ├── dto/                 # リクエスト / レスポンス DTO
│   ├── entity/              # DB エンティティ (Product, User)
│   ├── exception/           # カスタム例外・グローバルハンドラー
│   ├── mapper/              # MyBatis マッパー
│   ├── security/            # JWT フィルター・SecurityConfig
│   ├── service/             # ビジネスロジック
│   └── util/                # ユーティリティクラス
│
├── src/main/resources/
│   ├── application.yml      # アプリケーション設定
│   └── schema.sql           # DB スキーマ（起動時自動適用）
│
└── wms-frontend/            # React フロントエンド
    └── src/
        ├── components/      # UI コンポーネント
        ├── pages/           # ページコンポーネント
        └── i18n/            # 多言語翻訳ファイル
```

---

## セットアップ手順

### 前提条件
- Java 17 以上
- Node.js 18 以上
- MySQL 8.x（ポート 3306）
- Redis 7.x（ポート 6379）

### 1. データベース作成

```sql
CREATE DATABASE IF NOT EXISTS wms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 設定ファイル編集

`src/main/resources/application.yml` を編集：

```yaml
spring:
  datasource:
    password: <your-mysql-password>   # ← MySQL パスワードを設定

jwt:
  secret: <32文字以上のランダム文字列>  # ← 本番では必ず変更
```

### 3. バックエンド起動

```bash
# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

### 4. フロントエンド起動

```bash
cd wms-frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

### 5. 初回ユーザー登録

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

---

## API リファレンス

### 認証

| メソッド | エンドポイント | 説明 | 認証要否 |
|--------|--------------|------|---------|
| POST | `/api/auth/register` | ユーザー登録 | 不要 |
| POST | `/api/auth/login` | ログイン（JWT 取得） | 不要 |

### 商品管理

| メソッド | エンドポイント | 説明 |
|--------|--------------|------|
| GET | `/api/products` | 全商品取得 |
| POST | `/api/products` | 商品追加 |
| PUT | `/api/products/{id}` | 商品更新 |
| DELETE | `/api/products/{id}` | 商品削除 |
| POST | `/api/products/batch-inbound` | 一括入庫（幂等性制御） |
| GET | `/api/products/export/all` | 全商品 Excel エクスポート |
| GET | `/api/products/export/low-stock` | 低在庫商品エクスポート |

### スキャン

| メソッド | エンドポイント | 説明 |
|--------|--------------|------|
| POST | `/api/scan/push` | スキャンデータ受信・中継 |
| POST | `/api/scan/undo` | 直前スキャンの取り消し |
| GET | `/api/scan/logs` | スキャンログ取得 |

### その他

| メソッド | エンドポイント | 説明 |
|--------|--------------|------|
| GET | `/api/dashboard/stats` | ダッシュボード統計 |
| GET | `/api/predictions/restock` | 補充予測リスト |
| GET | `/api/user/profile` | ユーザープロフィール |
| POST | `/api/user/update-profile` | プロフィール更新 |
| POST | `/api/user/update-password` | パスワード変更 |

---

## アーキテクチャ

```
┌─────────────────────────────────┐
│     フロントエンド (React)        │
│  ログイン / ダッシュボード / 予測  │
└──────────────┬──────────────────┘
               │ HTTP / WebSocket
┌──────────────▼──────────────────┐
│    Spring Boot バックエンド       │
│  JWT認証 | REST API | WebSocket  │
│  AOP幂等 | MyBatis | 補充予測    │
└────────┬──────────┬─────────────┘
         │          │
    ┌────▼───┐  ┌───▼───┐
    │ MySQL  │  │ Redis │
    └────────┘  └───────┘
```

---

## セキュリティ注意事項

> [!WARNING]
> **本番環境デプロイ前に必ず確認**

- `jwt.secret` を強力なランダム文字列（32文字以上）に変更する
- MySQL パスワードを環境変数で管理する（`${DB_PASSWORD}`）
- HTTPS を有効にする
- 本番 CORS オリジンを適切に制限する

---

## トラブルシューティング

| 症状 | 原因・対処 |
|------|----------|
| `Failed to configure a DataSource` | MySQL 起動確認、パスワード設定確認 |
| WebSocket 接続不可 | `vite.config.js` のプロキシ設定を確認 |
| スキャンが PC に届かない | 同一 Wi-Fi 確認、バックエンド URL 確認 |
| Redis 接続エラー | Redis 未起動の場合はローカルキャッシュで動作（分散環境は要設定） |

---

**最終更新**: 2026-05-13 | **バージョン**: 1.0.0
