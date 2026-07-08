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
本项目不仅是一套中小型电商仓库的数字化解决方案，更是一个极度追求极致体验的**商业级全栈 SaaS 级应用**。系统集成了实时 WebSocket 扫码联动、AI 指数平滑预测补货、以及基于 Redis 的毫秒级操作员通信。

### 🌉 Bridge Engineer 视角：设计赋能开发 (Design-Led Development)
作为兼具专业品牌设计经验与后端架构能力的 Bridge Engineer，我坚持**零第三方 UI 库依赖**。全站交互按钮基于 `React + Tailwind CSS + CSS Variables` 三层架构纯手写实现。
* **极低认知负荷**：通过严格的视觉隐喻（如 `#bcf540` 荧光绿作为核心行动点）和微动效（`active:scale-[0.98]`），将后端复杂的幂等性批处理、JWT 鉴权状态，转化为极度平滑的“零思考”操作流。
* **技术解决痛点**：利用 STOMP + Redis Pub/Sub 实现无缝协同，结合 Python AI 引擎的前瞻性预测，彻底解决传统仓储“沟通滞后”与“盲目补货”的死穴。

---

<a id="日本語"></a>
## 🗻 日本語版：ビジネス価値と技術的アプローチ

### 🎯 プロジェクトの位置づけ
本プロジェクトは、中小規模のEコマース倉庫が抱える核心的な課題を直接解決する**商用レベルのフルスタックソリューション**です。WebSocketによるリアルタイム在庫同期、AI（指数平滑法）を活用した予測型補充、Redisベースのオペレーター間通信を統合しています。

### 🌉 ブリッジエンジニアの視点：デザイン主導開発 (Design-Led Development)
プロフェッショナルなブランドデザイン経験とバックエンド開発能力を併せ持つブリッジエンジニアとして、**外部 UI ライブラリに一切依存しない**フロントエンド構築を行いました。
* **認知負荷の最小化**：厳密なインフォメーションアーキテクチャとマイクロアニメーション（例：ブランドカラー `#bcf540` による視線誘導）により、バックエンドの複雑なバッチ処理やJWT認証を、現場作業員が「直感的」に操作できるUIへと昇華。
* **技術による課題解決**：STOMPとRedisを用いたリアルタイムチャット、Python APIによるAI予測エンジンにより、従来の「コミュニケーションの遅れ」と「欠品・過剰在庫」の連鎖を断ち切ります。

---

<a id="english"></a>
## 🌍 English Version: Core Value & Engineering Excellence

### 🎯 Project Positioning
An enterprise-grade, full-stack warehousing solution designed to eliminate operational bottlenecks in fast-paced e-commerce fulfillment. SpeedWMS integrates real-time WebSocket scanning, AI-driven predictive restocking, and millisecond-latency operator communications.

### 🌉 The Bridge Engineer Perspective: Design-Led Development
Combining professional brand design expertise with full-stack architecture, I engineered the frontend with **zero third-party UI component libraries**, relying entirely on a robust `React + Tailwind + CSS Variables` tri-layer architecture.
* **Minimizing Cognitive Load**: By utilizing strict visual metaphors and micro-animations, complex backend processes (like idempotent batch operations and JWT state management) are translated into frictionless, zero-error workflows for warehouse staff.
* **Engineering Impact**: Eliminates traditional communication silos and blind restocking through STOMP+Redis real-time chat and a dedicated Python/FastAPI AI predictive engine.

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
