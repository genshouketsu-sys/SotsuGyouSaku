# SpeedWMS 🚀

<table>
<tr>
<td width="33%"><b>🇨🇳 中文</b></td>
<td width="33%"><b>🇯🇵 日本語</b></td>
<td width="34%"><b>🇺🇸 English</b></td>
</tr>
<tr>
<td>具备预测性物流功能的仓库管理系统</td>
<td>予測型ロジスティクスを備えた倉庫管理システム</td>
<td>Warehouse Management System with Predictive Logistics</td>
</tr>
</table>

---

## 系统概述 / システム概要 / System Overview

<table>
<tr>
<td width="33%">

SpeedWMS 是为中小型仓库设计的实时库存管理系统。

**数据流：**
```
手机扫码 → Spring Boot后端 → PC浏览器
```

</td>
<td width="33%">

SpeedWMS は、小〜中規模の倉庫向けのリアルタイム在庫管理システムです。

**データフロー：**
```
スマホスキャン → バックエンド → PC
```

</td>
<td width="34%">

SpeedWMS is a real-time inventory management system designed for small to mid-sized warehouses.

**Data Flow:**
```
Mobile Scan → Spring Boot API → PC Browser
```

</td>
</tr>
</table>

### 核心功能 / 主な特徴 / Core Features

| 🇨🇳 中文 | 🇯🇵 日本語 | 🇺🇸 English |
|---|---|---|
| 📱 移动端扫码（JAN/QR码） | モバイルスキャン（JAN/QRコード） | Mobile barcode scanning (JAN/QR) |
| 📡 WebSocket 实时中继 | WebSocket リアルタイム中継 | Real-time WebSocket relay to PC |
| 🤖 AI 预测补货（指数平滑） | AI 予測補充（指数平滑法） | AI predictive restocking (exp. smoothing) |
| 🔐 JWT 无状态认证 | JWT ステートレス認証 | Stateless JWT authentication |
| 🌏 中日英三语 UI | 日中英 3言語 UI | Trilingual UI (ZH/JA/EN) |
| 📦 幂等性防重提交 | 冪等性制御・二重送信防止 | Idempotent batch inbound control |
| 📤 Excel 导出 | Excel エクスポート | Excel data export |
| 🌙 深色/浅色主题 | ダーク/ライトテーマ切替 | Dark / Light theme toggle |

---

## 技术栈 / 技術スタック / Tech Stack

| 层级 / レイヤー / Layer | 技术 / 技術 / Technology |
|---|---|
| 🇨🇳 **后端** / 🇯🇵 **バックエンド** / 🇺🇸 **Backend** | Java 22, Spring Boot 3.2, Spring Security, MyBatis, MariaDB/MySQL 8, Redis 7 |
| 🇨🇳 **AI 预测** / 🇯🇵 **AI 予測** / 🇺🇸 **AI Engine** | Python 3.10+, FastAPI, PyMySQL, Exponential Smoothing |
| 🇨🇳 **前端** / 🇯🇵 **フロントエンド** / 🇺🇸 **Frontend** | React 19, Vite, Tailwind CSS, Three.js, WebSocket, Axios |

---

## 按钮实现技术 / ボタン実装技術 / Button Implementation

<table>
<tr>
<td width="33%">

所有交互按钮均使用 **React + Tailwind CSS + CSS 变量** 三层架构实现，无任何第三方 UI 组件库。

</td>
<td width="33%">

全インタラクティブボタンは **React + Tailwind CSS + CSS 変数** の3層構造で実装しており、外部 UI ライブラリは一切不使用。

</td>
<td width="34%">

All interactive buttons are implemented with a **React + Tailwind CSS + CSS Variables** tri-layer architecture, with zero third-party UI component libraries.

</td>
</tr>
</table>

### 各按钮实现细节 / 各ボタンの実装詳細 / Per-Button Implementation Details

| 按钮 / ボタン / Button | 中文说明 | 日本語説明 | English |
|---|---|---|---|
| **侧边栏导航** | Tailwind 条件类 + CSS 变量 | 条件クラス + CSS 変数 | Conditional Tailwind classes + CSS vars |
| **批量入库** | `bg-[#bcf540]` + Axios POST | 固定ブランドカラー + Axios | Brand color + Axios POST request |
| **一括入庫** | `Ctrl+Enter` 键盘快捷键 | キーボードショートカット対応 | `Ctrl+Enter` keyboard shortcut |
| **确认入库（行级）** | hover 反色交互 | ホバーで反転色 | Hover color inversion effect |
| **清空扫描** | `window.confirm()` 二次确认 | 二段階確認ダイアログ | Two-step confirm dialog |
| **过滤器切换** | `statusFilter` state toggle | フィルタ state トグル | Filter state toggle |
| **主题切换 ☀️🌙** | `data-theme` + localStorage | `data-theme` 属性切替 | `data-theme` attr + localStorage |
| **语言切换 EN/ZH/JA** | LanguageContext 全局 | グローバル LanguageContext | Global LanguageContext + persist |
| **用户头像菜单** | 相对定位 dropdown | 相対位置 dropdown | Relative-positioned dropdown |
| **扫码 FAB 浮动** | `fixed bottom-12 right-12` | fixed 絶対配置 | Fixed-position floating action btn |
| **执行补货订单** | 乐观更新 + console.info | 楽観的 UI 更新 | Optimistic UI update |
| **AI 刷新模型** | `animate-spin` 加载态 | スピンアニメ + disabled | Spinner animation + disabled state |
| **商品 CRUD** | 模态框表单 + REST 请求 | モーダルフォーム + REST | Modal form + full REST CRUD |
| **Excel 导出** | `<a>` 标签直链下载 | リンクで直接ダウンロード | Anchor tag direct download link |
| **管理员设置保存** | inline toast 替代 alert | インライン toast 通知 | Inline toast (no `alert()`) |
| **移动端启动扫码** | 初始化 Html5Qrcode | Html5Qrcode カメラ起動 | Initialize Html5Qrcode camera |
| **移动端暂停/继续** | 条件激活色 `bg-[#bcf540]` | 条件アクティブカラー | Conditional active color |
| **移动端撤销** | `navigator.vibrate()` 震动 | バイブレーション API | Vibration API feedback |
| **登录/注册提交** | disabled 防重 + 文字切换 | disabled + テキスト切替 | Disabled state + loading text |
| **退出登录** | 清除 localStorage + 跳转 | localStorage クリア | Clear localStorage + redirect |

### 通用设计规范 / 共通デザイン規則 / Universal Design Rules

| 项目 / 項目 / Item | 🇨🇳 规则 | 🇯🇵 規則 | 🇺🇸 Rule |
|---|---|---|---|
| 主品牌色 | `#bcf540` 荧光绿 | `#bcf540` 蛍光グリーン | `#bcf540` Neon green |
| 加载状态 | `disabled` + `animate-spin` | `disabled` + スピン | Disabled + spinner icon |
| 危险操作 | `text-red-400` + `hover:bg-red-500/10` | 赤系スタイル | Red tone with hover bg |
| 成功反馈 | inline toast（无 `alert()`） | インライン toast | Inline toast (no `alert()`) |
| 微动效 | `active:scale-[0.98]` + `hover:brightness-110` | マイクロアニメーション | Micro-animation on active/hover |
| 键盘支持 | `Ctrl+Enter` 批量入库 | キーボードショートカット | `Ctrl+Enter` batch stock-in |

---

## API 接口 / API リファレンス / API Reference

| 方法 | 路径 / パス / Path | 🇨🇳 说明 | 🇯🇵 説明 | 🇺🇸 Description | 认证 |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | 用户注册 | ユーザー登録 | Register | 公开/公開/Public |
| POST | `/api/auth/login` | 登录获取 JWT | ログイン | Login & get JWT | 公开/公開/Public |
| GET  | `/api/products` | 商品列表 | 商品一覧 | List products | JWT |
| POST | `/api/products` | 添加商品 | 商品追加 | Add product | JWT |
| PUT  | `/api/products/{id}` | 更新商品 | 商品更新 | Update product | JWT |
| DELETE | `/api/products/{id}` | 删除商品 | 商品削除 | Delete product | JWT |
| POST | `/api/products/batch-inbound` | 批量入库（幂等） | 一括入庫（冪等） | Batch stock-in (idempotent) | JWT |
| GET  | `/api/products/export/all` | 导出全部 Excel | 全商品エクスポート | Export all to Excel | JWT |
| GET  | `/api/products/export/low-stock` | 导出低库存 Excel | 低在庫エクスポート | Export low-stock to Excel | JWT |
| POST | `/api/scan/push` | 推送扫码数据 | スキャン送信 | Push scan data | 公开/公開/Public |
| POST | `/api/scan/undo` | 撤销最后扫码 | 直前スキャン取消 | Undo last scan | 公开/公開/Public |
| GET  | `/api/scan/logs` | 扫描日志列表 | スキャンログ一覧 | Scan log list | JWT |
| GET  | `/api/dashboard/stats` | 仪表板统计 | ダッシュボード統計 | Dashboard statistics | JWT |
| GET  | `/api/predictions/restock` | 补货预测（AI优先） | 補充予測（AI優先） | Restock predictions (AI-first) | JWT |
| GET  | `/api/predictions/restock/ai` | AI 专用预测 | AI 専用予測 | AI-only predictions | JWT |
| POST | `/api/predictions/refresh` | 触发 AI 再学习 | AI 再学習トリガー | Trigger AI model refresh | JWT |
| GET  | `/api/user/profile` | 获取用户资料 | プロフィール取得 | Get user profile | JWT |
| PUT  | `/api/user/profile` | 更新用户资料 | プロフィール更新 | Update profile | JWT |
| PUT  | `/api/user/password` | 修改密码 | パスワード変更 | Change password | JWT |

### HTTP 状态码 / ステータスコード / HTTP Status Codes

| 状态码 | 🇨🇳 含义 | 🇯🇵 意味 | 🇺🇸 Meaning |
|---|---|---|---|
| `200` | 成功 | 成功 | OK |
| `201` | 创建成功 | 作成成功 | Created |
| `400` | 参数缺失/无效 | パラメータ不正 | Bad Request |
| `401` | JWT 无效/过期 | JWT 無効・期限切れ | Unauthorized |
| `403` | 权限不足 | 権限不足 | Forbidden |
| `404` | 资源不存在 | リソース未存在 | Not Found |
| `500` | 服务端异常（含 timestamp）| サーバーエラー（timestamp付）| Server Error (with timestamp) |

---

## 项目结构 / プロジェクト構成 / Project Structure

```
SotsuGyouSaku/
├── src/main/java/com/wms/wmsbackend/
│   ├── controller/          # REST API（全面规范化 / 全面規範化 / Fully normalized）
│   ├── service/             # 业务逻辑 / ビジネスロジック / Business logic
│   ├── mapper/              # MyBatis 数据访问 / データアクセス / Data access
│   ├── entity/              # 实体类 / エンティティ / Entities
│   ├── dto/                 # 数据传输对象 / DTO / DTOs
│   ├── security/            # JWT 过滤器 / フィルター / JWT filter
│   └── config/              # WebSocket, CORS 配置 / 設定 / Config
├── src/main/resources/      # 配置 & SQL / 設定 & SQL / Config & SQL
├── wms-frontend/src/
│   ├── components/          # PcDashboard, MobileScanner, AdminSettingsModal...
│   ├── pages/               # LoginPage
│   └── i18n/                # 多语言 / 多言語 / i18n Context
├── prediction-engine/       # Python AI 微服务 / AI 予測サービス / AI microservice
├── docs/                    # 详细文档 / 詳細ドキュメント / Detailed docs
└── CHANGELOG.md             # 变更日志 / 変更履歴 / Changelog
```

---

## 部署步骤 / デプロイ手順 / Deployment

### 1. 数据库 / データベース / Database

```sql
CREATE DATABASE IF NOT EXISTS wms_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 执行 / 実行 / Run: src/main/resources/schema.sql & data.sql
```

### 2. 后端配置 / バックエンド設定 / Backend Config

```yaml
# src/main/resources/application.yml
spring:
  datasource:
    password: <MySQL密码 / パスワード / password>
jwt:
  secret: <32位以上密钥 / 32文字以上 / 32+ char secret>
```

### 3. 启动后端 / バックエンド起動 / Start Backend

```bash
# Windows
mvnw.cmd spring-boot:run
# Linux / macOS
./mvnw spring-boot:run
```

### 4. 启动 AI 服务 / AI サービス起動 / Start AI Engine

```bash
cd prediction-engine
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 5. 启动前端 / フロントエンド起動 / Start Frontend

```bash
cd wms-frontend
npm install
npm run dev
# 访问 / アクセス / Visit: https://localhost:5173
```

### 6. 移动端连接 / モバイル接続 / Mobile Connection

<table>
<tr>
<td width="33%">

手机浏览器访问：
`https://<PC_IP>:5173/scanner`

点击「高级」→「继续前往」绕过自签名证书警告

</td>
<td width="33%">

スマホブラウザでアクセス：
`https://<PC_IP>:5173/scanner`

「詳細設定」→「アクセスする」で自己署名証明書の警告を回避

</td>
<td width="34%">

Open on mobile browser:
`https://<PC_IP>:5173/scanner`

Click "Advanced" → "Proceed to ... (unsafe)" to bypass self-signed cert warning

</td>
</tr>
</table>

---

## 数据库表 / テーブル / Database Tables

| 表名 / テーブル / Table | 🇨🇳 说明 | 🇯🇵 説明 | 🇺🇸 Description |
|---|---|---|---|
| `product` | 商品、库存、日均用量 | 商品情報・在庫・日次使用量 | Products, stock, daily usage |
| `wms_user` | 用户、密码哈希、角色 | ユーザー・パスワードハッシュ・ロール | Users, hashed password, role |
| `wms_scan_log` | 扫码流水日志 | スキャン履歴ログ | Barcode scan history log |

---

## 安全注意 / セキュリティ注意 / Security Notes

<table>
<tr>
<td width="33%">

- 生产环境必须修改 `jwt.secret`
- 限制 CORS 跨域来源
- MySQL 错误 → 确认服务是否启动
- Redis 失败 → 自动降级为内存缓存

</td>
<td width="33%">

- 本番環境では `jwt.secret` を必ず変更
- CORS 許可オリジンを制限すること
- MySQL エラー → 起動状態を確認
- Redis エラー → 自動的にローカルキャッシュへ切替

</td>
<td width="34%">

- Always change `jwt.secret` in production
- Restrict CORS allowed origins
- MySQL error → check if service is running
- Redis failure → auto-fallback to in-memory cache

</td>
</tr>
</table>

---

**バージョン / 版本 / Version**: `2.2.0` &nbsp;|&nbsp; **更新日 / 更新时间 / Updated**: 2026-06-17
