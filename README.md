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

## 📂 项目结构与模块划分 (Project Structure)

本项目采用 Monorepo 架构进行管理，按业务边界拆分为后端主服务、前端工程与独立 AI 微服务，并全面支持 Docker 容器化部署。

```text
SotsuGyouSaku/
├── src/                        # ☕️ Spring Boot 后端核心服务
│   ├── main/java/...           # 包含 REST API, JWT 鉴权, 幂等性控制逻辑
│   └── main/resources/         # 数据库配置、MyBatis 映射文件及基础 SQL 脚本
├── wms-frontend/               # ⚛️ React 19 前端工程
│   ├── src/components/         # 纯手写组件库 (Tailwind CSS + CSS Variables)
│   ├── src/chat/               # 基于 React Portal 与 STOMP 的全局聊天模块
│   └── src/i18n/               # 中/日/英三语国际化上下文配置
├── prediction-engine/          # 🐍 Python AI 预测微服务
│   ├── main.py                 # FastAPI 路由入口
│   └── model.py                # 指数平滑法算法实现
├── docs/                       # 📄 项目文档与需求分析
├── docker-compose.yml          # 🐳 本地与生产环境容器编排
├── Dockerfile.backend          # 📦 后端服务生产环境镜像构建
├── pom.xml                     # 🐘 Maven 依赖管理
└── .env.example                # ⚙️ 环境变量配置模板

🗻 日本語版：プロジェクト概要と開発アプローチ
🎯 プロジェクト紹介
SpeedWMSは、中小規模のEコマース倉庫向けに開発されたリアルタイム在庫管理システムです。基本的な入出庫・棚卸機能に加え、現場のデータ遅延という課題に注力しています。WebSocketを利用したモバイル端末とPC間のミリ秒単位のデータ同期や、Python FastAPIによる指数平滑法を用いた発注予測の補助機能などを実装しました。

🎨 デザインとエンジニアリングの融合
過去5年間のデザイン経験から、「機能が優れていてもUI/UXが悪いと現場に定着しない」という課題を何度も目にしてきました。そのため、本プロジェクトではデザイン思考をシステム開発に直接落とし込んでいます。

🌍 English Version: Overview & Philosophy
🎯 Project Introduction
SpeedWMS is a real-time inventory management system built for small-to-medium e-commerce warehouses. Beyond standard inventory tracking, the project focuses on eliminating data latency in warehouse operations. It features millisecond-level syncing between mobile scanners and PC dashboards via WebSocket, and integrates a Python FastAPI microservice that uses exponential smoothing to provide baseline restocking predictions.

🎨 Merging Design and Engineering
Drawing from my 5 years of professional design experience, I’ve often seen powerful systems fail in execution due to poor user interfaces. In this project, I aimed to bridge the gap between design thinking and backend architecture.

🏗️ 核心系统架构图 (System Architecture)
graph TD
    %% Nodes with explicit style definitions
    Mobile[Mobile Scanner]
    Web[Web Dashboard]
    Gateway{Spring Security<br>JWT Auth}
    CoreLogic[Business Logic]
    WS_Manager((STOMP/WebSocket))
    AI_Engine[FastAPI Predictor]
    DB[(PostgreSQL 16)]
    Redis[(Redis 7)]

    %% Styling
    style Mobile fill:#18181b,stroke:#bcf540,color:#fff
    style Web fill:#18181b,stroke:#bcf540,color:#fff
    style CoreLogic fill:#6db33f,stroke:#fff,color:#fff
    style WS_Manager fill:#6db33f,stroke:#fff,color:#fff
    style Gateway fill:#6db33f,stroke:#fff,color:#fff
    style AI_Engine fill:#3776ab,stroke:#fff,color:#fff
    style DB fill:#336791,stroke:#fff,color:#fff
    style Redis fill:#dc382d,stroke:#fff,color:#fff

    %% Subgraph
    subgraph Frontend [React 19 Frontend]
        Mobile
        Web
    end

    subgraph Backend [Spring Boot 3.2 Backend]
        CoreLogic
        WS_Manager
    end

    %% Connections
    Mobile <-->|REST| Gateway
    Web <-->|REST| Gateway
    Gateway --> CoreLogic
    CoreLogic --> DB
    CoreLogic <--> Redis
    CoreLogic <-->|REST| AI_Engine
    AI_Engine --> DB
    Mobile <-->|WSS| WS_Manager
    Web <-->|WSS| WS_Manager
    WS_Manager <-->|Pub/Sub| Redis
    Mobile <-->|WSS| WS_Manager
    Web <-->|WSS| WS_Manager
    WS_Manager <-->|Pub/Sub| Redis
