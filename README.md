# SpeedWMS (极速仓管) - Setup Guide

SpeedWMS is a modern Warehouse Management System with real-time scanning relay and AI-driven restocking predictions.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your target machine:
- **Java 17 or higher** (OpenJDK recommended)
- **Node.js 18.x or higher** & **npm**
- **MySQL 8.0 or higher**
- **Maven** (Optional, `mvnw` wrapper included)

---

## 🚀 Getting Started

### 1. Database Setup
1. Open your MySQL client and create a new database:
   ```sql
   CREATE DATABASE wms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Import the schema and initial data:
   - Run `src/main/resources/schema.sql`
   - Run `src/main/resources/data.sql`

### 2. Backend Configuration
1. Navigate to `src/main/resources/application.yml`.
2. Update the datasource configuration with your local MySQL credentials:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/wms_db?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
       username: YOUR_USERNAME
       password: YOUR_PASSWORD
   ```

### 3. Launching the Backend
1. In the root directory, build and run the Spring Boot application:
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```
   *The backend will start on `http://localhost:8080`.*

### 4. Launching the Frontend
1. Navigate to the `wms-frontend` directory:
   ```bash
   cd wms-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The dashboard will be available at `https://localhost:5173`.*

---

## 📱 Mobile Scanner Setup (Crucial)
To use a physical phone as a scanner:
1. Ensure your PC and Phone are on the **same Wi-Fi network**.
2. Note your PC's **LAN IP address** (e.g., `192.168.1.5`).
3. Open the browser on your phone and go to: `https://YOUR_PC_IP:5173/scanner`.
4. **Important**: Since the site uses a self-signed SSL certificate:
   - Click "Advanced" or "Show details".
   - Click "**Proceed to ... (unsafe)**".
   - Grant camera permissions when prompted.

---

## 🛠 Features
- **Live Sync**: Real-time barcode relay via WebSockets.
- **AI Forecasting**: Predictive restock alerts based on daily usage rates.
- **Multilingual**: Supports English, Chinese (极速仓管), and Japanese (SpeedWMS).
- **Admin Control**: Profile management and secure password updates.

## 📜 Tech Stack
- **Backend**: Spring Boot 3, MyBatis, MySQL, Spring Security (JWT).
- **Frontend**: React, Vite, Tailwind CSS, Material Symbols.
- **Communication**: WebSockets for real-time telemetry.
