# Speed WMS - AI Prediction Engine

AI による予測性補充 (Predictive Restock) マイクロサービス。

## Quick Start

```bash
cd prediction-engine
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
python main.py
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | ヘルスチェック |
| GET | `/api/v1/predictions/restock` | 全商品の補充予測 |
| GET | `/api/v1/predictions/restock/{sku_code}` | SKU 別予測 |
| POST | `/api/v1/predictions/refresh` | モデル再学習 |

API ドキュメント: http://127.0.0.1:8000/docs

## Architecture

**MVP**: FastAPI REST API (同期) + バッチ予測
**Future**: Redis Pub/Sub (非同期) + リアルタイム予測
