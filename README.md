<div align="center">
  <h1>🚀 SpeedWMS (SotsuGyouSaku)</h1>
  <p><strong>A Commercial-Grade Full-Stack Warehouse Management System with Predictive Logistics</strong></p>
  <p>
    <a href="#中文">🇨🇳 中文</a> | 
    <a href="#日本語">🇯🇵 日本語</a> | 
    <a href="#english">🇺🇸 English</a>
  </p>
</div>

---

<a id="中文"></a>
## 🌏 中文版：核心业务价值与技术沉淀

### 🎯 项目定位
SpeedWMS 是专为中小型电商仓库打造的预测型库存管理系统。本项目不仅提供基础的数字化仓储流转，更以商业 SaaS 级标准构建了从前端交互到后端高并发处理的完整闭环，无缝集成了 WebSocket 实时同步、AI 指数平滑预测补货以及 Redis 毫秒级通信流。

### 🌉 设计赋能开发 (Design-Led Development)

作为兼具 5 年品牌设计经验与全栈架构能力的 Bridge Engineer，我坚持在本项目中零第三方 UI 库依赖。全站核心交互均基于 `React + Tailwind CSS + CSS Variables` 架构从零构建。

为了将一线业务人员的认知负荷降至最低，系统引入了克制且精确的视觉隐喻（如全局唯一的 `#bcf540` 荧光绿行动点）与物理反馈级微动效（`active:scale-[0.98]`）。这种设计主导的工程落地，成功将后端复杂的幂等性批处理、JWT 鉴权校验等逻辑，封装为极其平滑且防呆的“零思考”操作流。

在底层架构支撑上，系统通过 STOMP 协议与 Redis Pub/Sub 实现了跨设备状态的即时一致性，并引入 Python 独立微服务进行前瞻性数据演算，从根本上解决了传统仓储业务中“数据孤岛”与“盲目依赖经验补货”的工程级痛点。

---

<a id="日本語"></a>
## 🗻 日本語版：ビジネス価値と技術的アプローチ

### 🎯 プロジェクトの位置づけ
SpeedWMSは、中小規模のEコマース倉庫向けに開発された予測型在庫管理システムです。単なる業務のデジタル化にとどまらず、商用SaaS水準のアーキテクチャを採用し、WebSocketによるリアルタイム同期、AI（指数平滑法）による予測補充、そしてRedisを活用した低遅延通信をシームレスに統合しています。

### 🌉 ブリッジエンジニアの視点：デザイン主導開発 (Design-Led Development)

5年間のブランドデザイン経験とバックエンド開発スキルを融合させ、外部のUIコンポーネントライブラリに一切依存しない、`React + Tailwind CSS + CSS Variables` による独自の実装を行いました。

現場作業員の認知負荷を極限まで下げるため、キーカラー（`#bcf540`）を用いた視線誘導や物理的なマイクロアニメーション（`active:scale-[0.98]`）をシステム全体に適用しています。このデザイン主導のアプローチにより、バックエンドの複雑なバッチ処理やJWT認証の仕組みを、直感的でミスの起きないスムーズな操作フローへと変換しました。

さらに技術的な課題解決として、STOMPプロトコルとRedis Pub/Subを用いたリアルタイム連携機能、およびPython AIエンジンによる高精度の需要予測を実装し、従来の倉庫業務における「データのサイロ化」と「勘に頼った発注」という根本的な課題をエンジニアリングの力で解決しています。

---

<a id="english"></a>
## 🌍 English Version: Core Value & Engineering Excellence

### 🎯 Project Positioning
SpeedWMS is a predictive inventory management system engineered for small-to-medium e-commerce warehouses. Moving beyond basic digitization, it delivers a SaaS-grade full-stack architecture that seamlessly integrates real-time WebSocket synchronization, AI-driven (exponential smoothing) restocking predictions, and Redis-backed low-latency communications.

### 🌉 The Bridge Engineer Perspective: Design-Led Development

Leveraging five years of professional brand design experience alongside robust backend engineering capabilities, I built the entire frontend from scratch without relying on third-party UI libraries, utilizing a custom `React + Tailwind CSS + CSS Variables` architecture.

To strictly minimize cognitive load on warehouse staff, the system employs clear visual metaphors (such as the `#bcf540` neon green primary action color) and tactile micro-animations (`active:scale-[0.98]`). This design-first philosophy successfully abstracts complex backend operations—like idempotent batching and JWT state management—into a frictionless, zero-error workflow.

On the engineering front, the integration of STOMP and Redis Pub/Sub enables instant cross-device state consistency, while a dedicated Python microservice provides forward-looking inventory calculations. This architecture systematically eliminates the historical industry bottlenecks of isolated data silos and reactive restocking practices.

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
    subgraph Frontend [UI / UX Layer - React 19]
        Mobile[Mobile Scanner<br>JAN/QR Code]:::frontend
        Web[Web Dashboard<br>Zero 3rd-Party UI]:::frontend
    end

    %% Gateway
    Gateway{Spring Security &<br>JWT Stateless Auth}:::backend

    %% Backend Services
    subgraph Spring Boot 3.2 Backend
        CoreLogic[Business Logic<br>Idempotent Batch]:::backend
        WS_Manager((STOMP WebSocket<br>Manager)):::backend
    end

    %% AI Microservice
    AI_Engine[FastAPI Prediction Engine<br>Exponential Smoothing]:::ai

    %% Data Layer
    DB[(PostgreSQL 16<br>ACID Transactions)]:::database
    Redis[(Redis 7<br>Pub/Sub & Cache)]:::cache

    %% Connections
    Mobile <-->|REST/HTTPS| Gateway
    Web <-->|REST/HTTPS| Gateway
    
    Gateway --> CoreLogic
    CoreLogic --> DB
    CoreLogic <--> Redis
    CoreLogic <-->|Trigger via REST| AI_Engine
    AI_Engine --> DB

    %% Real-time Flow
    Mobile <-->|WSS| WS_Manager
    Web <-->|WSS| WS_Manager
    WS_Manager <-->|Message Broker| Redis
