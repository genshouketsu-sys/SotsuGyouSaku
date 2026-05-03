# SpeedWMS (极速仓管) 🚀

[English](#english) | [简体中文](#简体中文) | [日本語](#日本語)

---

<a name="english"></a>
## 🇬🇧 English: High-Performance Real-Time WMS

SpeedWMS is a next-generation Warehouse Management System designed for high-density logistics environments. It features a robust real-time scanning relay system and AI-driven inventory forecasting.

### 🏗 Architecture & Core Technologies
- **Real-Time Telemetry**: Bi-directional communication via **WebSockets (STOMP)**, enabling sub-100ms latency barcode relay from mobile scanners to the PC dashboard.
- **Predictive Analytics**: A custom forecasting engine utilizing historical usage rates and lead-time analysis to predict stock depletion and suggest optimized reorder points.
- **Security Stack**: Stateless authentication using **JWT (JSON Web Tokens)** integrated with **Spring Security**, featuring custom filters for cross-origin mobile access.
- **Data Layer**: High-concurrency persistence via **MyBatis** with an optimized **MySQL** schema.

### 🚀 Setup & Installation
1. **Prerequisites**: Java 17+, Node.js 18+, MySQL 8.0+.
2. **Database**: Create `wms_db` and execute `schema.sql` and `data.sql`.
3. **Backend**: Update `application.yml` with your DB credentials, then run `./mvnw spring-boot:run`.
4. **Frontend**: Navigate to `wms-frontend`, run `npm install` and `npm run dev`.

---

<a name="简体中文"></a>
## 🇨🇳 简体中文: 高性能实时仓管系统

SpeedWMS（极速仓管）是专为高密度物流环境设计的下一代仓库管理系统。该系统集成了强大的实时扫描中继系统和基于 AI 的库存预测功能。

### 🏗 架构与核心技术
- **实时遥测**: 采用 **WebSockets (STOMP)** 实现双向通信，确保手机扫描端到 PC 端仪表的条码传输延迟低于 100ms。
- **预测分析**: 内置自定义预测引擎，利用历史消耗率和交货周期分析，预测库存耗尽时间并建议最优订货点。
- **安全体系**: 基于 **Spring Security** 和 **JWT** 的无状态认证，配备针对移动端跨域访问的自定义安全过滤器。
- **数据层**: 使用 **MyBatis** 进行高并发持久化，并配合优化的 **MySQL** 数据库架构。

### 🚀 安装与启动
1. **环境准备**: Java 17+, Node.js 18+, MySQL 8.0+。
2. **数据库**: 创建 `wms_db` 数据库，并依次执行 `schema.sql` 和 `data.sql`。
3. **后端**: 在 `application.yml` 中配置你的数据库账号密码，运行 `./mvnw spring-boot:run`。
4. **前端**: 进入 `wms-frontend` 目录，执行 `npm install` 后运行 `npm run dev`。

---

<a name="日本語"></a>
## 🇯🇵 日本語: 高性能リアルタイム倉庫管理システム

SpeedWMS（スピードWMS）は、高密度な物流環境向けに設計された次世代倉庫管理システムです。強力なリアルタイム・スキャン・リレー・システムと、AIによる在庫予測機能を搭載しています。

### 🏗 アーキテクチャとコア技術
- **リアルタイム・テレメトリ**: **WebSockets (STOMP)** を採用した双方向通信により、モバイル端末からPCダッシュボードへのバーコード転送レイテンシを100ms以下に抑制。
- **予測分析**: 過去の消費率とリードタイム分析を利用した独自の予測エンジンを搭載。在庫枯渇時期を予測し、最適な再発注ポイントを提案。
- **セキュリティ**: **Spring Security** と **JWT** を組み合わせたステートレス認証。モバイル端末からのクロスドメイン・アクセスに対応したカスタムフィルタを実装。
- **データレイヤー**: **MyBatis** による高並列処理と、最適化された **MySQL** スキーマによる永続化。

### 🚀 セットアップと実行
1. **前提条件**: Java 17+, Node.js 18+, MySQL 8.0+。
2. **データベース**: `wms_db` を作成し、`schema.sql` と `data.sql` を実行してください。
3. **バックエンド**: `application.yml` にDB情報を設定し、`./mvnw spring-boot:run` を実行。
4. **フロントエンド**: `wms-frontend` ディレクトリで `npm install` を行い、`npm run dev` を実行。

---

### ⚠️ Mobile Connection Warning (局域网连接注意事项)
For physical mobile scanning, your PC and Phone must be on the same Wi-Fi. Access `https://YOUR_PC_IP:5173/scanner`. **You must manually accept the self-signed SSL certificate on your mobile browser.**
手机扫描时，请确保手机与电脑处于同一 Wi-Fi。访问 `https://电脑IP:5173/scanner`。**必须在手机浏览器中手动点击“继续访问（不安全）”以通过自签名证书校验。**
モバイル端末でスキャンする場合、PCと同じWi-Fiに接続し、`https://PCのIP:5173/scanner` にアクセスしてください。**ブラウザのセキュリティ警告で「詳細」から「アクセスを続行」を必ず選択してください。**
