# Speed WMS — 中文文档

> **具备预测性物流功能的仓库管理系统**

---

## 系统概述

Speed WMS 是为中小型仓库设计的实时库存管理系统。

```
智能手机（摄像头扫码）
       ↓  HTTP POST /api/scan/push
Spring Boot 后端
       ↓  WebSocket 中继
PC 浏览器（仪表盘）
```

**核心功能：**
- 📱 移动端扫码：使用手机摄像头读取 JAN 条形码
- 📡 WebSocket 实时中继：扫描结果即时推送到 PC
- 📊 补货预测：基于过去14天扫描数据计算补货时机
- 🔐 JWT 认证：无状态 Bearer Token 认证
- 🌏 多语言支持：日语 / 中文 / English 三语 UI
- 📦 含幂等性控制的批量入库
- 📤 Excel 导出功能

---

## 技术栈

### 后端
| 技术 | 用途 |
|------|------|
| Java 17 + Spring Boot 3.x | 应用基础框架 |
| Spring Security 6.x + JWT | 认证与授权 |
| Spring WebSocket | 实时通信 |
| MyBatis 3.x | ORM 框架 |
| MySQL 8.x | 主数据库 |
| Redis 7.x | 幂等性缓存 |
| Apache POI 5.x | Excel 导出 |

### 前端
| 技术 | 用途 |
|------|------|
| React 18.x + Vite 5.x | UI 框架 |
| Axios 1.x | HTTP 客户端 |
| React Router 6.x | SPA 路由 |
| html5-qrcode 2.x | 条形码扫描 |

---

## 项目结构

```
SotsuGyouSaku/
├── src/main/java/com/wms/wmsbackend/
│   ├── annotation/          # @Idempotent 自定义注解
│   ├── aspect/              # AOP 幂等性切面
│   ├── config/              # Bean 配置 / WebSocket 配置
│   │   ├── AppConfig.java       # RestTemplate / ObjectMapper Bean
│   │   ├── ScanWebSocketHandler.java
│   │   └── WebSocketConfig.java
│   ├── controller/          # REST 控制器
│   ├── dto/                 # 请求 / 响应 DTO
│   │   ├── LoginRequestDto.java
│   │   ├── RegisterRequestDto.java
│   │   └── RestockSuggestionDto.java
│   ├── entity/              # 数据库实体 (Product, User)
│   ├── exception/           # 自定义异常 / 全局处理器
│   ├── mapper/              # MyBatis Mapper 接口
│   ├── security/            # JWT 过滤器 / SecurityConfig
│   ├── service/             # 业务逻辑层
│   └── util/                # 工具类
│
├── src/main/resources/
│   ├── application.yml      # 应用配置
│   └── schema.sql           # 数据库 Schema（启动时自动执行）
│
└── wms-frontend/            # React 前端
    └── src/
        ├── components/      # UI 组件
        ├── pages/           # 页面组件
        └── i18n/            # 多语言翻译文件
```

---

## 快速启动

### 前置条件
- Java 17 或以上
- Node.js 18 或以上
- MySQL 8.x（端口 3306）
- Redis 7.x（端口 6379）

### 1. 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS wms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 修改配置文件

编辑 `src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    password: <你的MySQL密码>      # ← 填写 MySQL 密码

jwt:
  secret: <32位以上随机字符串>     # ← 生产环境必须修改
```

### 3. 启动后端

```bash
# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

### 4. 启动前端

```bash
cd wms-frontend
npm install
npm run dev
```

浏览器访问 `http://localhost:5173`。

### 5. 初次用户注册

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

---

## API 参考

### 认证接口

| 方法 | 路径 | 描述 | 是否需要认证 |
|------|------|------|------------|
| POST | `/api/auth/register` | 用户注册 | 否 |
| POST | `/api/auth/login` | 登录（获取 JWT） | 否 |

### 商品管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/products` | 获取全部商品 |
| POST | `/api/products` | 添加商品 |
| PUT | `/api/products/{id}` | 更新商品 |
| DELETE | `/api/products/{id}` | 删除商品 |
| POST | `/api/products/batch-inbound` | 批量入库（含幂等性控制） |
| GET | `/api/products/export/all` | 导出全部商品 Excel |
| GET | `/api/products/export/low-stock` | 导出低库存商品 Excel |

### 扫描接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/scan/push` | 接收扫描数据并中继 |
| POST | `/api/scan/undo` | 撤销最后一次扫描 |
| GET | `/api/scan/logs` | 获取扫描日志 |

### 其他接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/dashboard/stats` | 仪表盘统计数据 |
| GET | `/api/predictions/restock` | 补货预测列表 |
| GET | `/api/user/profile` | 获取用户信息 |
| POST | `/api/user/update-profile` | 更新用户信息 |
| POST | `/api/user/update-password` | 修改密码 |

---

## 系统架构

```
┌──────────────────────────────────┐
│       前端（React）               │
│  登录页 / 仪表盘 / 补货预测        │
└──────────────┬───────────────────┘
               │ HTTP / WebSocket
┌──────────────▼───────────────────┐
│      Spring Boot 后端             │
│  JWT认证 | REST API | WebSocket   │
│  AOP幂等 | MyBatis | 补货预测引擎  │
└────────┬──────────┬──────────────┘
         │          │
    ┌────▼───┐  ┌───▼───┐
    │ MySQL  │  │ Redis │
    └────────┘  └───────┘
```

---

## 数据库表结构

### product（商品表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| sku_code | varchar(50) | SKU 编码，唯一 |
| name | varchar(100) | 商品名称 |
| barcode | varchar(100) | 条形码 |
| stock | int | 当前库存 |
| daily_usage | decimal(10,2) | 日均使用量 |
| lead_time_days | int | 补货周期（天） |
| safety_stock | int | 安全库存 |
| create_time | timestamp | 创建时间 |

### wms_user（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| username | varchar(50) | 用户名，唯一 |
| password_hash | varchar(255) | BCrypt 哈希密码 |
| role | varchar(20) | 角色（ROLE_USER / ROLE_ADMIN） |
| display_name | varchar(100) | 显示名称 |
| email | varchar(100) | 邮箱 |

### wms_scan_log（扫描日志表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| barcode | varchar(100) | 条形码 |
| user_id | varchar(50) | 操作员 ID |
| scan_time | timestamp | 扫描时间 |

---

## 代码规范说明

本项目已完成以下代码规范整改：

| 问题 | 解决方案 |
|------|---------|
| `System.out.println` 直接输出 | 统一使用 SLF4J `Logger` |
| `@CrossOrigin` 重复声明 | 在 `SecurityConfig` 统一配置 CORS |
| `ObjectMapper`/`RestTemplate` 直接 `new` | 通过 `AppConfig` Bean 注入 |
| 完全限定类名（FQCN）直接使用 | 改为 `import` 引入 |
| `Boolean` 包装类型 | 改为 `boolean` 原始类型 |
| `java.util.Date` 使用 | 改为 `java.time.LocalDateTime` |
| 内部静态 DTO 类 | 提取为独立 DTO 文件 |
| JWT 密钥硬编码 | 改为 `application.yml` 配置项 |
| 重复翻译键 `centerBarcode` | 重命名为 `readyToScanHint` |

---

## 安全注意事项

> [!WARNING]
> **生产环境部署前必须检查**

- 将 `jwt.secret` 修改为强随机字符串（32位以上）
- 通过环境变量管理 MySQL 密码（`${DB_PASSWORD}`）
- 启用 HTTPS
- 将 CORS 限制为实际前端域名
- Redis 配置访问认证

---

## 常见问题

| 现象 | 原因与解决方案 |
|------|--------------|
| `Failed to configure a DataSource` | 检查 MySQL 是否启动、密码是否正确 |
| WebSocket 无法连接 | 检查 `vite.config.js` 中的代理配置 |
| 扫描数据未到达 PC | 确认手机与 PC 在同一 Wi-Fi；检查后端 URL |
| Redis 连接失败 | 未启动 Redis 时将降级为本地缓存（分布式环境需配置 Redis） |

---

**最后更新**: 2026-05-15 | **版本**: 1.1.0 | **语言**: 中文

---

## 更新日志

### v1.1.0 (2026-05-15)

#### 🐛 Bug 修复

| 类别 | 描述 |
|------|------|
| Excel 导出 | 修复导出文件中文/日文字符乱码问题（移除 `ExcelExportUtil` 中多余的字节转换逻辑） |
| Excel 导出 | 修复 HTTP 响应头：使用标准 XLSX MIME 类型及 `ContentDisposition` 正确处理 UTF-8 文件名 |
| CSV 导出 | 添加 UTF-8 BOM (`\uFEFF`)，解决 Windows Excel 打开 CSV 时中文乱码问题 |
| CSV 导出 | 条形码列改用 Excel 文本强制格式 (`="..."`)，防止长数字被转为科学计数法 |
| CSV 导出 | 修复创建时间列无法显示的问题（正确处理含秒的 ISO-8601 字符串，避免时区偏差） |
| 日期序列化 | 在 `application.yml` 全局配置 Jackson：`write-dates-as-timestamps: false`，使 `LocalDateTime` 以 ISO-8601 字符串输出，不再以数组形式输出 |
| 前端时间格式化 | 升级 `formatDateTime` 函数，兼容旧数组格式和新 ISO 字符串格式，并正确显示秒数 |

#### ✨ 新功能

| 类别 | 描述 |
|------|------|
| UI 组件 | 新增引导页线框按钮组件 `ModernWireframeButton`，含霓虹光晕、流光动效、微动动画等高级设计效果 |
