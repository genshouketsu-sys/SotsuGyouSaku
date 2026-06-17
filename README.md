# SpeedWMS (极速仓管 / 極速倉庫管理) 🚀

> 具备预测性物流功能的仓库管理系统 / 予測型ロジスティクスを備えた倉庫管理システム

---

## 系统概述 / システム概要

SpeedWMS 是为中小型仓库设计的实时库存管理系统。
SpeedWMS は、小〜中規模の倉庫向けのリアルタイム在庫管理システムです。

```
智能手机（扫码）/ スマートフォン（スキャン） -> Spring Boot 后端/バックエンド -> PC 浏览器/PC ブラウザ
```

**核心功能 / 主な特徴：**
- 📱 移动端扫码 / モバイルスキャン：使用手机摄像头读取 JAN 条码 / スマホカメラで JAN コード読み取り
- 📡 WebSocket 中继 / WebSocket リレー：扫码结果实时传输至 PC / スキャン結果をリアルタイムで PC に反映
- 🤖 AI 预测补货 / AI 予測補充：Python FastAPI 微服务，利用指数平滑预测需求 / Python による需要予測
- 🔐 JWT 认证 / 認証：基于 JWT 的无状态认证 / JWT によるステートレス認証
- 🌏 多语言 / 多言語：支持中、日、英三语 UI / 日・中・英の3言語 UI
- 📦 幂等性控制 / 冪等性制御：防止表单和批量入库重复提交 / 二重送信防止
- 📤 导出功能 / エクスポート：商品数据 Excel 导出 / Excel エクスポート
- 🌙 深色/浅色主题 / ダーク/ライトテーマ：完全 CSS 变量主题切换系统

---

## 技术栈 / 技術スタック

- **后端 / バックエンド**: Java 22, Spring Boot 3.2, Spring Security (JWT), MyBatis, MariaDB/MySQL 8, Redis 7
- **AI 预测 / AI 予測**: Python 3.10+, FastAPI, PyMySQL, 指数平滑法 (Exponential Smoothing)
- **前端 / フロントエンド**: React 19, Vite, Tailwind CSS, Three.js, WebSocket, Axios

---

## 按钮实现技术说明 / ボタン実装技術解説

本系统所有交互按钮均使用 **React + Tailwind CSS + CSS 变量** 三层架构实现，无任何第三方 UI 组件库。
本システムの全インタラクティブボタンは **React + Tailwind CSS + CSS 変数** の3層構造で実装されており、外部 UI ライブラリは一切使用していません。

### 主要按钮类型 / 主要ボタン種別

| 按钮位置 / 場所 | 样式方案 / スタイル手法 | 交互实现 / インタラクション実装 |
|---|---|---|
| 侧边栏导航按钮 | Tailwind 条件类 + CSS 变量颜色 | React `onClick` 切换 `currentView` state |
| 批量入库按钮 | Tailwind `bg-[#bcf540]` 固定品牌色 | `async/await` + Axios POST 请求 |
| 一括入庫 (Batch Stock-In) | Tailwind hover + `brightness-110` | 键盘快捷键 `Ctrl+Enter` 绑定 |
| 确认入库（行级）| Tailwind 条件渲染 + hover 反色 | 单条 Barcode → `/api/products/batch-inbound` |
| 清空扫描 (Clear All) | `text-red-400 hover:bg-red-500/10` | `window.confirm()` 二次确认 |
| 过滤器切换 | Tailwind 激活态条件类 | 状态 toggle：`statusFilter` state |
| 主题切换 ☀️/🌙 | CSS 变量 `var(--color-accent)` | `data-theme` 属性切换 + `localStorage` 持久化 |
| 语言切换 EN/ZH/JA | Tailwind pill 布局 + 激活态高亮 | `LanguageContext` + `localStorage` 持久化 |
| 用户头像菜单 | Tailwind 相对定位 dropdown | `showUserMenu` state + 点击外部关闭 |
| 扫码 FAB 浮动按钮 | `fixed bottom-12 right-12` + 圆形 | 打开 `ScanQrModal`（QR 码展示模态框）|
| 执行补货订单 | `bg-[#bcf540]` + `active:scale-95` | 乐观更新：从预测列表移除 + `console.info` |
| AI 刷新模型 | 旋转动画 `animate-spin` 加载态 | Axios POST → `/api/predictions/refresh` |
| 商品添加/编辑 | 模态框内表单 Submit 按钮 | 表单 `onSubmit` + REST CRUD |
| 商品删除 | `text-red-400` 图标按钮 | DELETE 请求 + 本地 state 过滤 |
| Excel 导出 | `<a>` 标签 + `href` 直链 | GET `/api/products/export/all` 触发文件下载 |
| 管理员设置保存 | `disabled` 加载态 + `animate-spin` | PUT `/api/user/profile` + PUT `/api/user/password` |
| 移动端扫码启动 | 圆形大按钮 + hover scale | 初始化 `Html5Qrcode` 相机实例 |
| 移动端暂停/继续 | 条件激活色 `bg-[#bcf540]` / 透明 | `scannerRef.current.pause()` / `.resume()` |
| 移动端撤销 | 成功态 `bg-green-600` 动态反馈 | Axios POST `/api/scan/undo` + 震动 `navigator.vibrate()` |
| 登录/注册提交 | `disabled` 防重复 + 加载文字切换 | Axios POST `/api/auth/login` + JWT 存入 localStorage |
| 退出登录 | `text-red-400` 菜单项 | 清除 `wms_token` + 跳转 `/login` |

### 通用设计规范 / 共通デザイン規則

```
主品牌色:   #bcf540 (荧光绿 / 蛍光グリーン) — 主操作按钮背景
加载状态:   disabled + opacity-50 + animate-spin 图标
危险操作:   text-red-400 + hover:bg-red-500/10 + border-red-500/20
成功反馈:   inline toast (CSS 变量着色) — 不使用 alert()
微动效:     active:scale-[0.98] / hover:brightness-110 / transition-all
键盘支持:   Ctrl+Enter 触发批量入库
```

### 状态码规范 / HTTP ステータスコード規則（后端接口已全面规范化）

```
200 OK           — 查询、更新、删除成功
201 Created      — 新建商品成功
400 Bad Request  — 参数缺失（name/skuCode 为空、密码字段为空等）
401 Unauthorized — JWT 无效或过期（自动跳转登录页）
403 Forbidden    — 权限不足
404 Not Found    — 资源不存在（商品、用户）
500 Server Error — 数据库/服务异常（含 timestamp 和 error 字段）
```

---

## 项目结构 / プロジェクト構成

```
SotsuGyouSaku/
├── src/main/java/com/wms/wmsbackend/   # Java 后端源码 / バックエンドソース
│   ├── controller/                     # REST API 控制器（全面规范化）
│   ├── service/                        # 业务逻辑层
│   ├── mapper/                         # MyBatis 数据访问层
│   ├── entity/                         # 实体类
│   ├── dto/                            # 数据传输对象
│   ├── security/                       # JWT 认证过滤器
│   └── config/                         # Spring 配置（WebSocket、CORS）
├── src/main/resources/                 # 配置文件及SQL / 設定ファイルとSQL
├── wms-frontend/                       # React 前端源码 / フロントエンドソース
│   └── src/
│       ├── components/                 # PcDashboard, MobileScanner, AdminSettingsModal...
│       ├── pages/                      # LoginPage
│       └── i18n/                       # 多语言 Context（中/日/英）
├── prediction-engine/                  # Python AI 预测微服务 / AI 予測サービス
├── docs/                               # 详细文档 / 詳細ドキュメント
└── CHANGELOG.md                        # 变更日志 / 変更履歴
```

---

## 部署步骤 / デプロイ手順

### 1. 数据库 / データベース
```sql
CREATE DATABASE IF NOT EXISTS wms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 执行 src/main/resources/schema.sql & data.sql 初始化数据
-- src/main/resources/schema.sql と data.sql を実行して初期化
```

### 2. 后端配置 / バックエンド設定
编辑 / 編集 `src/main/resources/application.yml`：
```yaml
spring:
  datasource:
    password: <你的MySQL密码 / MySQLパスワード>
jwt:
  secret: <32位以上密钥 / 32文字以上のキー>
```

### 3. 启动后端 / バックエンド起動
```bash
# Windows
mvnw.cmd spring-boot:run
# Linux / macOS
./mvnw spring-boot:run
```

### 4. 启动 AI 服务 / AI サービス起動
```bash
cd prediction-engine
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 5. 启动前端 / フロントエンド起動
```bash
cd wms-frontend
npm install
npm run dev
```

### 6. 移动端扫码连接 / モバイル端末の接続
- 手机访问 / スマホでアクセス: `https://<PC_IP>:5173/scanner`
- 绕过安全警告（自签名证书）/ セキュリティ警告を回避（自己署名証明書のため）: **高级 -> 继续前往 / 詳細設定 -> アクセスする**

---

## API 参考 / API リファレンス

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 / ユーザー登録 | 公开 |
| POST | `/api/auth/login` | 登录获取 JWT / ログイン | 公开 |
| GET  | `/api/products` | 商品列表 / 商品一覧 | JWT |
| POST | `/api/products` | 添加商品（需 name+skuCode）/ 追加 | JWT |
| PUT  | `/api/products/{id}` | 更新商品 / 更新 | JWT |
| DELETE | `/api/products/{id}` | 删除商品 / 削除 | JWT |
| POST | `/api/products/batch-inbound` | 批量入库（幂等）/ 一括入庫 | JWT |
| GET  | `/api/products/export/all` | 导出 Excel（全量）| JWT |
| GET  | `/api/products/export/low-stock` | 导出 Excel（低库存）| JWT |
| POST | `/api/scan/push` | 推送扫码数据 / スキャン送信 | 公开 |
| POST | `/api/scan/undo` | 撤销最后一次扫码 / 取り消し | 公开 |
| GET  | `/api/scan/logs` | 扫描日志列表 / ログ一覧 | JWT |
| GET  | `/api/dashboard/stats` | 仪表板统计（含 timestamp）| JWT |
| GET  | `/api/predictions/restock` | 补货预测（AI优先）/ 補充予測 | JWT |
| GET  | `/api/predictions/restock/ai` | AI 专用预测 / AI 専用 | JWT |
| POST | `/api/predictions/refresh` | 触发 AI 再学习 / 再学習 | JWT |
| GET  | `/api/user/profile` | 获取用户资料 / プロフィール取得 | JWT |
| PUT  | `/api/user/profile` | 更新资料（displayName/email/avatar）| JWT |
| PUT  | `/api/user/password` | 修改密码 / パスワード変更 | JWT |

---

## 数据库表 / データベーステーブル

- **`product`**: 商品信息、库存及日均用量 / 商品情報、在庫、日次平均使用量
- **`wms_user`**: 用户账号、密码哈希及角色 / ユーザーアカウント、パスワードハッシュ、ロール
- **`wms_scan_log`**: 扫码流水日志 / バーコードスキャンの履歴ログ

---

## 安全与异常 / セキュリティとエラー対処

- 生产环境务必修改 `jwt.secret` 并限制 CORS 跨域 / 本番環境では必ず `jwt.secret` を変更し CORS を制限してください。
- 数据库连接错误时，请确认 MySQL/MariaDB 是否启动 / データベース接続エラー時は MySQL 起動状態を確認してください。
- Redis 连接失败时，系统将自动降级为本地内存缓存运行 / Redis 接続エラー時は自動的にローカルキャッシュへフォールバックします。
- 所有敏感错误均由后端 try-catch 捕获，返回含 `timestamp` 的结构化 JSON / 全エラーは try-catch で捕捉し、`timestamp` を含む JSON を返します。

---

**版本 / バージョン**: 2.2.0 | **更新时间 / 更新日**: 2026-06-17
