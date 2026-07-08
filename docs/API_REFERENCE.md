# Speed WMS — API Reference

> Base URL (local dev): `https://localhost:5173/api`
> Base URL (production): `http://<host>/api`
> All endpoints (except `/auth/*`) require `Authorization: Bearer <JWT>` header.

---

## Authentication `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register new operator account |
| `POST` | `/auth/login` | ❌ | Login, returns JWT token |

### POST /auth/login
```json
// Request
{ "username": "admin", "password": "yourpassword" }

// Response 200
{ "success": true, "token": "eyJ...", "username": "admin" }

// Response 401
{ "success": false, "message": "Invalid credentials" }
```

---

## Products `/api/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | ✅ | List all products |
| `POST` | `/products` | ✅ | Create new product |
| `PUT` | `/products/{id}` | ✅ | Update product |
| `DELETE` | `/products/{id}` | ✅ | Delete product |
| `POST` | `/products/batch-inbound` | ✅ | Batch stock-in by barcode list |

---

## Scanning `/api/scan`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/scan/logs` | ✅ | Fetch recent scan logs (latest 20) |
| `POST` | `/scan` | ✅ | @Idempotent — Record single scan event |

### WebSocket (Raw WS)
```
ws://localhost:8080/ws/scan?clientId=pc_<username>
```
- **Receive**: `{ "barcode": "4901234567890", "name": "Product Name" }` or `UNDO_LAST_ACTION`
- **Mobile → Relay → PC Dashboard** pattern

---

## Dashboard `/api/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/dashboard/stats` | ✅ | Returns `{ totalActiveSKUs, scansToday, lowStockAlerts }` |

---

## AI Prediction `/api/predictions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/predictions/restock` | ✅ | Get restock suggestion list (AI + rule fallback) |
| `POST` | `/predictions/refresh` | ✅ | Trigger AI model retrain |

### Restock Suggestion Object
```json
{
  "skuCode": "SKU-10001",
  "name": "コカコーラ 500ml",
  "currentStock": 5,
  "safetyStock": 10,
  "reorderPoint": 15,
  "suggestedOrderQuantity": 50,
  "urgency": "High",
  "daysUntilDepletion": 2,
  "confidenceScore": 0.87,
  "predictionSource": "ai_exponential_smoothing",
  "reason": "Stock critically below safety threshold, 2 days until depletion."
}
```

---

## Operator Chat `/ws-chat`

| Protocol | Endpoint | Auth | Description |
|---|---|---|---|
| `STOMP/WS` | `/ws-chat/info` | ✅ | SockJS handshake endpoint |
| `STOMP SUB` | `/topic/chat` | ✅ | Subscribe to broadcast messages |
| `STOMP PUB` | `/app/chat.send` | ✅ | Send message to all operators |

---

## User Profile `/api/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/user/profile` | ✅ | Get current user's profile |
| `PUT` | `/user/profile` | ✅ | Update display name / avatar URL |

---

## Error Response Format

All error responses follow the standard format:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "code": "OPTIONAL_ERROR_CODE"
}
```

| HTTP Status | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing/expired JWT) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Resource not found |
| `409` | Conflict (idempotency key collision) |
| `500` | Internal Server Error |
