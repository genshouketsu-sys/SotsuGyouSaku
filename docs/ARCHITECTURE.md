# Speed WMS — Architecture Overview

> Commercial-Grade Monorepo | Spring Boot 3.2 + React 19 + FastAPI + PostgreSQL + Redis

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Docker Network: wms-network              │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │  wms-frontend │    │ wms-backend  │    │ wms-prediction   │   │
│  │ React + Nginx │───▶│ Spring Boot  │───▶│ FastAPI (Python) │   │
│  │   Port: 80   │    │  Port: 8080  │    │   Port: 8000     │   │
│  └──────────────┘    └──────┬───────┘    └──────────────────┘   │
│                             │                        │            │
│                    ┌────────┴────────┐               │            │
│                    │                 │               │            │
│              ┌─────▼──────┐  ┌──────▼──────┐        │            │
│              │ wms-postgres│  │  wms-redis  │◀───────┘            │
│              │  Port: 5432 │  │  Port: 6379 │                    │
│              └────────────┘  └─────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Responsibilities

| Service | Technology | Role |
|---|---|---|
| `wms-frontend` | React 19 + Vite + Nginx | SPA, API proxy, WebSocket relay |
| `wms-backend` | Spring Boot 3.2, Java 17, MyBatis | Business logic, JWT auth, WebSocket |
| `wms-prediction` | Python 3.11, FastAPI, Uvicorn | AI prediction engine (exponential smoothing) |
| `wms-postgres` | PostgreSQL 16 | Primary datastore |
| `wms-redis` | Redis 7 | Idempotency keys, WebSocket sessions, Pub/Sub |

---

## Backend Package Structure

```
com.wms.wmsbackend/
├── annotation/      # @Idempotent custom annotation
├── aspect/          # AOP — IdempotentAspect, LoggingAspect
├── chat/            # Operator real-time chat (Redis Pub/Sub + STOMP)
│   ├── dto/
│   ├── entity/
│   ├── redis/
│   └── service/
├── config/          # Spring beans (AppConfig, WebSocketConfig)
├── controller/      # REST controllers (Auth, Product, Scan, Prediction, Dashboard)
├── dto/             # Request/Response DTOs
├── entity/          # JPA/MyBatis entities
├── exception/       # GlobalExceptionHandler
├── mapper/          # MyBatis mappers (XML + interface)
├── security/        # JWT (JwtUtil, JwtAuthFilter, SecurityConfig)
├── service/         # Business logic layer
└── util/            # Shared utilities
```

---

## Frontend Structure

```
wms-frontend/src/
├── components/      # Reusable UI components (Modals, Dashboard, Scanner)
├── pages/           # Route-level pages (LoginPage, ProductCatalog)
├── chat/            # Operator chat feature (ChatContext, OperatorChat)
├── i18n/            # Internationalization (EN / ZH / JA)
├── App.jsx          # Router + Axios interceptors + WebSocket
└── main.jsx         # Vite entry point
```

---

## Key Design Patterns

### Idempotency (防重复提交)
- Custom `@Idempotent` annotation + Spring AOP
- Strategies: `TOKEN`, `USER_ID`, `PARAM_HASH`
- Backed by Redis with automatic local-cache fallback
- See: [idempotent.md](./idempotent.md)

### AI Prediction Fallback
- Primary: Python FastAPI exponential smoothing model
- Fallback: Java rule-based engine (triggers automatically if AI engine is down)
- Confidence tiers: `HIGH / MEDIUM / LOW / RULE_BASED`

### Security
- JWT HS256 with no hardcoded fallback — app fails fast if `JWT_SECRET` is unset
- Non-root container users for all services
- All secrets injected via environment variables exclusively

---

## Spring Profile Strategy

| Profile | Activation | Purpose |
|---|---|---|
| `dev` | `.env.local` → `SPRING_PROFILES_ACTIVE=dev` | Local development, verbose logging, data.sql seed |
| `prod` | `.env.prod` → `SPRING_PROFILES_ACTIVE=prod` | Production, HikariCP tuning, minimal log, Actuator restricted |

---

## Port Map

| Port | Service | Note |
|---|---|---|
| `80` | wms-frontend (Nginx) | Public HTTP |
| `8080` | wms-backend | Internal, proxied via Nginx `/api/`, `/ws/` |
| `8000` | wms-prediction | Internal only |
| `5432` | wms-postgres | Exposed for DB tooling (remove in production) |
| `6379` | wms-redis | Exposed for debugging (remove in production) |
| `5173` | Vite dev server | Local development only |
