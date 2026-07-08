<div align="center">
  <h1>🚀 SpeedWMS</h1>
  <p><strong>A Real-Time Warehouse Management System Built with Spring Boot & React</strong></p>
  <p>
    <a href="#中文">🇨🇳 中文</a> | 
    <a href="#日本語">🇯🇵 日本語</a> | 
    <a href="#english">🇺🇸 English</a>
  </p>
</div>

---

<a id="中文"></a>
## 🌏 中文版：项目概述与开发理念

### 🎯 项目介绍
SpeedWMS 是一款面向中小型电商仓库的实时库存管理系统。在实现基础入库、出库与盘点功能之外，本项目重点解决了仓储操作中的数据延迟问题：通过 WebSocket 实现移动端扫码与 PC 端的毫秒级同步；并引入 Python FastAPI 微服务，利用指数平滑法为库存补货提供基础的数据预测辅助。

### 🎨 设计与工程的结合
在我过去的 5 年专业设计经验中，我经常看到优秀的功能因为糟糕的交互而难以落地。因此，在这个全栈项目中，我尝试将设计思维直接融入工程实现：

* **自研 UI 架构**：为了保持对界面细节和暗黑模式的 100% 控制，本项目没有使用任何第三方 UI 组件库。所有交互按钮与布局均基于 `React + Tailwind CSS + CSS Variables` 纯手写实现。
* **降低认知负荷**：在前端，通过全局统一的 `#bcf540` 行动色与 `active:scale` 微动效进行视线引导；在后端，处理好接口的幂等性校验与 JWT 刷新逻辑。让复杂的业务流在用户端表现为“不会误触、不需多想”的顺滑体验。
* **可靠的数据流**：核心业务基于 Spring Boot 3.2 与 PostgreSQL 16 构建。对于需要跨设备即时通讯的操作员聊天模块，则引入了 STOMP 协议与 Redis Pub/Sub 来保障消息的送达率。

---

<a id="日本語"></a>
## 🗻 日本語版：プロジェクト概要と開発アプローチ

### 🎯 プロジェクト紹介
SpeedWMSは、中小規模のEコマース倉庫向けに開発されたリアルタイム在庫管理システムです。基本的な入出庫・棚卸機能に加え、現場のデータ遅延という課題に注力しています。WebSocketを利用したモバイル端末とPC間のミリ秒単位のデータ同期や、Python FastAPIによる指数平滑法を用いた発注予測の補助機能などを実装しました。

### 🎨 デザインとエンジニアリングの融合
過去5年間のデザイン経験から、「機能が優れていてもUI/UXが悪いと現場に定着しない」という課題を何度も目にしてきました。そのため、本プロジェクトではデザイン思考をシステム開発に直接落とし込んでいます：

* **独自UIアーキテクチャ**：UIコンポーネントライブラリ（MUIなど）に依存せず、`React + Tailwind CSS + CSS Variables` を用いてフロントエンドをゼロから構築しました。これにより、ダークモードの切り替えや細かなインタラクションを完全に制御しています。
* **認知負荷の軽減**：フロント側では、アクションカラー（`#bcf540`）の統一とマイクロアニメーションによって視線を誘導。バックエンド側では、APIの冪等性制御やJWTトークン管理を徹底し、ユーザーが「迷わず、誤操作なく」直感的に操作できる体験を実現しました。
* **信頼性の高いデータフロー**：基幹システムは Spring Boot 3.2 と PostgreSQL 16 で構築。オペレーター間のリアルタイムチャット機能には、STOMPプロトコルと Redis Pub/Sub を導入し、確実なメッセージ配信を担保しています。

---

<a id="english"></a>
## 🌍 English Version: Overview & Philosophy

### 🎯 Project Introduction
SpeedWMS is a real-time inventory management system built for small-to-medium e-commerce warehouses. Beyond standard inventory tracking, the project focuses on eliminating data latency in warehouse operations. It features millisecond-level syncing between mobile scanners and PC dashboards via WebSocket, and integrates a Python FastAPI microservice that uses exponential smoothing to provide baseline restocking predictions.

### 🎨 Merging Design and Engineering
Drawing from my 5 years of professional design experience, I’ve often seen powerful systems fail in execution due to poor user interfaces. In this project, I aimed to bridge the gap between design thinking and backend architecture:

* **Custom UI Architecture**: To maintain total control over interaction details and dark mode toggling, I intentionally avoided third-party UI libraries. The entire frontend is built from scratch using `React + Tailwind CSS + CSS Variables`.
* **Minimizing Cognitive Load**: Visually, the system relies on a consistent neon green (`#bcf540`) for primary actions and subtle tactile animations. Architecturally, it handles idempotent API requests and JWT state management cleanly in the background. The goal is to provide warehouse staff with a seamless, error-resistant workflow that requires zero overthinking.
* **Reliable Data Flow**: Core logic is built on Spring Boot 3.2 and PostgreSQL 16. For features requiring immediate cross-device syncing, like the operator chat, I implemented the STOMP protocol and Redis Pub/Sub to ensure reliable message delivery.

---

## 🏗️ 核心系统架构图 (System Architecture)

```mermaid
graph TD
    %% Define Styles
    classDef frontend fill:#18181b,stroke:#bcf540,stroke-width:2px,color:#fff;
    classDef backend fill:#6db33f,stroke:#fff,stroke-width:2px,color:#fff;
    classDef ai fill:#3776ab,stroke:#fff,stroke-width:2px,color:#fff;
    classDef database fill:#336791,stroke:#fff,stroke-width:2px,color:#fff;
    classDef cache fill:#dc382d,stroke:#fff,stroke-width:2px,color:#fff;

    %% Frontend Nodes
    subgraph Frontend [React 19 Frontend]
        Mobile[Mobile Scanner<br>Zero UI Lib]:::frontend
        Web[Web Dashboard<br>Zero UI Lib]:::frontend
    end

    %% Gateway
    Gateway{Spring Security<br>JWT Auth}:::backend

    %% Backend Services
    subgraph Backend [Spring Boot 3.2 Backend]
        CoreLogic[Business Logic<br>Idempotent Batch]:::backend
        WS_Manager((STOMP/WebSocket)):::backend
    end

    %% AI Microservice
    AI_Engine[FastAPI Predictor<br>Exp. Smoothing]:::ai

    %% Data Layer
    DB[(PostgreSQL 16)]:::database
    Redis[(Redis 7<br>Pub/Sub)]:::cache

    %% Connections
    Mobile <-->|REST/HTTPS| Gateway
    Web <-->|REST/HTTPS| Gateway
    
    Gateway --> CoreLogic
    CoreLogic --> DB
    CoreLogic <--> Redis
    CoreLogic <-->|REST| AI_Engine
    AI_Engine --> DB

    %% Real-time Flow
    Mobile <-->|WSS| WS_Manager
    Web <-->|WSS| WS_Manager
    WS_Manager <-->|Redis Broker| Redis
