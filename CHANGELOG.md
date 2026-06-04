# CHANGELOG

All notable changes to SpeedWMS will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
  - 服务：`wms-mysql` → `wms-redis` → `wms-backend` → `wms-prediction` → `wms-frontend`
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
