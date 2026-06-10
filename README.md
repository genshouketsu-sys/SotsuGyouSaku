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

---

## 技术栈 / 技術スタック

- **后端 / バックエンド**: Java 17, Spring Boot 3.x, Spring Security, MyBatis, MySQL 8.x, Redis 7.x
- **AI 预测 / AI 予測**: Python 3.10+, FastAPI, PyMySQL, 指数平滑法 (Exponential Smoothing)
- **前端 / フロントエンド**: React 19, Vite, Tailwind CSS, WebSockets (STOMP)

---

## 项目结构 / プロジェクト構成

```
SotsuGyouSaku/
├── src/main/java/com/wms/wmsbackend/   # Java 后端源码 / バックエンドソース
├── src/main/resources/                 # 配置文件及SQL / 設定ファイルとSQL
├── wms-frontend/                       # React 前端源码 / フロントエンドソース
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

- **认证 / 認証**: POST `/api/auth/register` (注册/登録), POST `/api/auth/login` (登录/ログイン)
- **商品 / 商品**: GET `/api/products` (列表/一覧), POST `/api/products` (添加/追加), PUT `/api/products/{id}` (更新), DELETE `/api/products/{id}` (删除/削除)
- **批量/导出 / 一括/出力**: POST `/api/products/batch-inbound` (批量入库/一括入庫), GET `/api/products/export/all` (导出/エクスポート)
- **扫描中继 / スキャン**: POST `/api/scan/push` (推送/送信), POST `/api/scan/undo` (撤销/取消), GET `/api/scan/logs` (日志/ログ)
- **AI 预测 / AI 予測**: GET `/api/predictions/restock` (补货建议/補充予測), POST `/api/predictions/refresh` (刷新模型/再学習)

---

## 数据库表 / データベーステーブル

- **`product`**: 商品信息、库存及日均用量 / 商品情報、在庫、日次平均使用量
- **`wms_user`**: 用户账号、密码哈希及角色 / ユーザーアカウント、パスワードハッシュ、ロール
- **`wms_scan_log`**: 扫码流水日志 / バーコードスキャンの履歴ログ

---

## 安全与异常 / セキュリティとエラー対処

- 生产环境务必修改 `jwt.secret` 并限制 CORS 跨域 / 本番環境では必ず `jwt.secret` を変更し CORS を制限してください。
- 数据库连接错误时，请确认 MySQL 是否启动 / データベース接続エラー時は MySQL 起動状態を確認してください。
- Redis 连接失败时，系统将自动降级为本地内存缓存运行 / Redis 接続エラー時は自動的にローカルキャッシュへフォールバックします。

---

**版本 / バージョン**: 2.1.0 | **更新时间 / 更新日**: 2026-06-10
