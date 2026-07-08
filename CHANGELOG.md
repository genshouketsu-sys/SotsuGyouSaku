# CHANGELOG

All notable changes to SpeedWMS will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v2.3.0] - 2026-07-08

### Security — Hardcoded Secret Elimination / 源码密鑰清除

- **[SEC-001 Fix]** 移除 `application.yml` 中硬编码的 JWT 密鑰
  - 改为 `${JWT_SECRET}` 环境变量注入，无 fallback 默认値
  - 违反配置时 Spring Boot 启动即抛异常，显式防止错误配置进入生产
- **[SEC-001 Fix]** 移除 `JwtUtil.java` `@Value` 注解中的硬编码默认密鑰元组
- **[SEC-001 Fix]** 移除 `application.yml` 中硬编码的 PostgreSQL 明文密码
  - 所有数据库认证信息改为 `${SPRING_DATASOURCE_*}` 环境变量
- **[ENG-001 Fix]** 全面升级 `.gitignore`
  - 新增 `.env` / `.env.prod` / `.env.local` glob 拦截
  - 新增 `wms-frontend/dist/` `node_modules/` `*.db` 等构建产物排除
- **[ENG-002 Fix]** 升级 `.env.example`
  - 补全 `SPRING_DATASOURCE_*` 、`SPRING_PROFILES_ACTIVE` 变量模板
  - 新增多环境使用说明（开发/生产分离方案）

- **[ENG-003 Fix]** Spring Boot 多 Profile 配置架构重构
  - 新增 `application-prod.yml` — 生产 Profile（HikariCP 连接池调优、Actuator 收紧）
  - 新增 `application-dev.yml` — 开发 Profile（详细日志、data.sql 种子数据）
  - `application.yml` 精简为纯框架级共享基础配置
- **[DOCS]** 新增工程文档
  - `docs/ARCHITECTURE.md` — 系统架构图、服务职责、包结构、Profile 策略
  - `docs/API_REFERENCE.md` — 完整 REST/WebSocket API 文档（含 STOMP 频道）
- **[REFACTOR]** 前端文件结构重构 — 符合 React 最佳实践
  - `AddProductModal/EditProductModal/BarcodeLookupModal` → `src/components/`
  - `ProductCatalog` → `src/pages/`
  - 同步更新所有 import 引用路径

---

## [v2.2.0] - 2026-06-27

### Changed — PostgreSQL Migration & UI Fixes

- **Database Migration**:
  - 全面从 MySQL 迁移至 PostgreSQL 16 (Migrated entirely from MySQL to PostgreSQL 16)
  - 替换 `mysql-connector-j` 为 `postgresql` JDBC 驱动
  - 替换 Python 预测引擎的 `pymysql` 为 `psycopg2-binary`
  - 重构所有 SQL 语句以适配 PostgreSQL 语法 (`BIGSERIAL`, `ON CONFLICT DO NOTHING`, `CURRENT_DATE`, `INTERVAL`)
  - 修复 `data.sql` 数据导入时的主键/唯一键冲突问题

- **UI & Dashboard Fixes**:
  - 修复仪表板“库存预警”卡片在 AI 预测未返回数据时点击无响应的问题
  - 修复初始 `00-X-ALPHA` 管理员密码哈希不匹配导致 401 登录失败的问题
  - 优化 React 组件状态更新逻辑，确保与后端 PostgreSQL 数据同步无缝衔接

---

## [v2.1.0] - 2026-06-04

### Added — Docker / 容器化支持 / コンテナ化

- `Dockerfile.backend` — Spring Boot 后端多阶段构建
  - 阶段1：`eclipse-temurin:17-jdk-alpine` 编译，Maven 依赖层缓存优化
  - 阶段2：`eclipse-temurin:17-jre-alpine` 运行，不含构建工具，镜像体积最小化
  - 非 root 用户 `appuser` 运行，JVM 容器内存自适应参数

- `wms-frontend/Dockerfile.frontend` — React/Vite 前端多阶段构建
  - 阶段1：`node:20-alpine` 执行 `npm ci` + `vite build`
  - 阶段2：`nginx:1.27-alpine` 静态服务，含 SPA 路由回退与 API 反向代理

- `prediction-engine/Dockerfile.prediction` — Python 3.11 FastAPI 预测引擎
  - `python:3.11-slim` 基础镜像，`PYTHONDONTWRITEBYTECODE` / `PYTHONUNBUFFERED` 优化
  - `pip install --no-cache-dir`，非 root 用户 `appuser` 运行

- `wms-frontend/nginx.conf` — Nginx 生产配置
  - SPA 路由：`try_files $uri /index.html`
  - `/api/` 反向代理 → `wms-backend:8080`
  - `/ws/` WebSocket 升级代理
  - 静态资源 1年缓存 + gzip 压缩

- `docker-compose.yml` — 全栈 5 容器编排
  - 服务：`wms-postgres` → `wms-redis` → `wms-backend` → `wms-prediction` → `wms-frontend`
  - `healthcheck` 依赖链，确保 MySQL/Redis 就绪后再启动 Spring Boot
  - 所有密钥通过 `--env-file .env.prod` 注入，不硬编码于镜像

- `.env.example` — 环境变量模板（含 JWT Secret 生成命令说明）

- `.dockerignore` / `wms-frontend/.dockerignore` / `prediction-engine/.dockerignore`
  - 分层过滤构建上下文，排除 `target/`、`node_modules/`、`venv/`、日志文件等

---

## [v2.0.0] - 2026-05-27

### Added — AI Predictive Restock / AI 補充予測 / AI智能预测补货

- `prediction-engine/` — Python FastAPI 独立 AI 预测微服务
  - 基于指数平滑法（Exponential Smoothing）的 90 天销量预测
  - `/api/v1/predict/restock` — 批量补货建议 API
  - `/api/v1/predict/refresh` — 模型刷新 API
  - MySQL 只读连接，自动根据历史销量计算安全库存

- `AiPredictionClient.java` — Spring Boot HTTP 客户端
  - 自动连接 AI 引擎；引擎宕机时自动回退内置规则引擎（Fallback）
  - 异步超时控制，不影响主业务流程

- `RestockPredictionService.java` — 预测结果聚合服务
  - AI 预测 + 规则引擎双模式无缝切换
  - 置信度分级（HIGH / MEDIUM / LOW / RULE_BASED）

- `PredictionController.java` — `/api/prediction/*` REST 接口
  - `GET /restock-suggestions` — 获取当前补货建议列表
  - `POST /refresh` — 触发 AI 模型刷新

- 前端仪表板新增 AI 预测面板
  - 置信度徽章（颜色分级）、AI 状态指示、"刷新模型"按钮

---

## [v1.1.0] - 2026-05-13

### Fixed

- 修复 CSV/Excel 导出编码乱码问题（BOM 头、UTF-8 强制输出）
- 新增线框模式按钮（3D 仓库视图切换）
- 启用 Jackson `JavaTimeModule`，修复 `LocalDateTime` 序列化导致的 403 错误

---

## [v1.0.0] - 2026-05-07

### Added — Initial Release

- Spring Boot 3.2 + Java 17 后端（MyBatis、Spring Security JWT）
- React 19 + Vite 前端（React Router、Axios、Three.js 3D 仓库视图）
- WebSocket STOMP 实时扫码中继（手机 → PC 仪表板）
- 高速 QR/条码扫描（25 FPS、硬件加速、精准中心对焦）
- 500+ 日本饮料 SKU 预置数据（JAN 码 + 图片）
- Excel 商品目录导出（Apache POI）
- 幂等键机制防重复提交（Redis + AOP）
