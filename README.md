# SpeedWMS (极速仓管) 🚀

[English](#english) | [简体中文](#简体中文) | [日本語](#日本語)

---

<a name="english"></a>
## 🇬🇧 English: Advanced Implementation & Deployment Guide

### 🏗 Architecture
SpeedWMS is a full-stack Warehouse Management System built for high reliability.
- **Backend**: Java 17, Spring Boot 3.2, Spring Security (JWT), MyBatis, MySQL 8.
- **Frontend**: React 18, Vite, Tailwind CSS, WebSockets (STOMP).
- **Relay**: Real-time barcode transmission from mobile cameras to PC dashboard using STOMP over WebSocket.

### 🚀 Step-by-Step Deployment

#### 1. Database Initialization
- Create schema: `wms_db`
- Character Set: `utf8mb4` | Collation: `utf8mb4_unicode_ci`
- Execute `src/main/resources/schema.sql` (Tables: product, wms_user, wms_scan_log).
- Execute `src/main/resources/data.sql` (Initial catalog and admin user).

#### 2. Backend Configuration
- Edit `src/main/resources/application.yml`:
  - Set `spring.datasource.password` to your MySQL root password.
  - Ensure `server.address: 0.0.0.0` is set to allow remote connections from the mobile scanner.
- Build: `./mvnw clean package`
- Run: `java -jar target/wms-backend-0.0.1-SNAPSHOT.jar` (Port: 8080).

#### 3. Frontend Configuration
- Edit `wms-frontend/vite.config.js`:
  - Ensure the proxy points to `http://localhost:8080`.
  - Set `server.host: true` to expose the UI to your local network.
- Install: `cd wms-frontend && npm install`
- Dev: `npm run dev` (Port: 5173).

#### 4. Mobile Integration (SSL Bypass)
- Open phone browser -> `https://<YOUR_PC_IP>:5173/scanner`.
- **IMPORTANT**: You will see a "Your connection is not private" error because of the self-signed dev certificate.
- Click **Advanced** -> **Proceed to <IP> (unsafe)**. This is required for the browser to allow camera access and WebSocket connection.

---

<a name="简体中文"></a>
## 🇨🇳 简体中文: 深度部署指南

### 🏗 系统架构
SpeedWMS 是一个为高可靠性设计的全栈仓库管理系统。
- **后端**: Java 17, Spring Boot 3.2, Spring Security (JWT), MyBatis, MySQL 8.
- **前端**: React 18, Vite, Tailwind CSS, WebSockets (STOMP).
- **中继**: 通过 WebSocket STOMP 协议实现手机摄像头扫描条码实时传输至 PC 端。

### 🚀 详细部署步骤

#### 1. 数据库初始化
- 创建数据库: `wms_db`
- 字符集: `utf8mb4` | 排序规则: `utf8mb4_unicode_ci`
- 运行 `src/main/resources/schema.sql` (创建 product, wms_user, wms_scan_log 表)。
- 运行 `src/main/resources/data.sql` (导入初始商品和管理员账号)。

#### 2. 后端配置与启动
- 编辑 `src/main/resources/application.yml`:
  - 将 `spring.datasource.password` 修改为你的 MySQL 密码。
  - 确保 `server.address: 0.0.0.0` 已设置，以便接收手机端的访问。
- 构建项目: `./mvnw clean package`
- 运行: `java -jar target/wms-backend-0.0.1-SNAPSHOT.jar` (默认端口: 8080)。

#### 3. 前端配置与启动
- 编辑 `wms-frontend/vite.config.js`:
  - 确认代理指向 `http://localhost:8080`。
  - 设置 `server.host: true` 使局域网内的设备可以访问 UI。
- 安装依赖: `cd wms-frontend && npm install`
- 启动: `npm run dev` (默认端口: 5173)。

#### 4. 移动端扫码连接 (SSL 绕过)
- 手机浏览器打开 `https://<电脑局域网IP>:5173/scanner`。
- **注意**: 由于开发环境下使用的是自签名证书，会提示“您的连接不是私密连接”。
- 必须点击 **高级** -> **继续前往 (不安全)**。只有这样，浏览器才会允许调用摄像头并建立 WebSocket 连接。

---

<a name="日本語"></a>
## 🇯🇵 日本語: 詳細デプロイ・ガイド

### 🏗 システム構成
SpeedWMS は、高い信頼性を備えたフルスタック倉庫管理システムです。
- **バックエンド**: Java 17, Spring Boot 3.2, Spring Security (JWT), MyBatis, MySQL 8.
- **フロントエンド**: React 18, Vite, Tailwind CSS, WebSockets (STOMP).
- **リレー機能**: WebSocket STOMP プロトコルにより、モバイル端末のカメラでスキャンしたバーコードをリアルタイムでPCダッシュボードへ送信。

### 🚀 デプロイ手順

#### 1. データベース初期化
- データベース作成: `wms_db`
- 文字コード: `utf8mb4` | 照合順序: `utf8mb4_unicode_ci`
- `src/main/resources/schema.sql` を実行（product, wms_user, wms_scan_log テーブルの作成）。
- `src/main/resources/data.sql` を実行（初期カタログと管理者ユーザーのインポート）。

#### 2. バックエンドの設定と起動
- `src/main/resources/application.yml` を編集:
  - `spring.datasource.password` を使用環境の MySQL パスワードに変更。
  - `server.address: 0.0.0.0` が設定されていることを確認（モバイル端末からのアクセスを許可するため）。
- ビルド: `./mvnw clean package`
- 実行: `java -jar target/wms-backend-0.0.1-SNAPSHOT.jar` (ポート: 8080)。

#### 3. フロントエンドの設定と起動
- `wms-frontend/vite.config.js` を確認:
  - プロキシが `http://localhost:8080` を向いていることを確認。
  - `server.host: true` を設定し、ローカルネットワーク内からUIにアクセス可能にする。
- インストール: `cd wms-frontend && npm install`
- 起動: `npm run dev` (ポート: 5173)。

#### 4. モバイル端末の接続 (SSL 回避)
- 携帯のブラウザで `https://<PCのIP>:5173/scanner` を開く。
- **重要**: 開発環境の自己署名証明書のため、「接続はプライベートではありません」という警告が表示されます。
- 必ず **詳細** または **詳細設定** をクリックし、「**<IP> にアクセスする（安全ではありません）**」を選択してください。これを行わないと、カメラの使用許可や WebSocket 通信がブラウザによってブロックされます。
