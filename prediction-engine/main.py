"""
FastAPI アプリケーション / FastAPI Application
Speed WMS - AI Prediction Engine

予測性補充 (Predictive Restock) のマイクロサービス。
Spring Boot バックエンドから同期 REST API で呼び出される。

将来: Redis Pub/Sub による非同期リアルタイム予測に移行予定。
Future: Will migrate to async real-time prediction via Redis Pub/Sub.
"""
import logging
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from config import settings
from models import RestockPrediction, HealthResponse, RefreshResponse
from predictor import engine

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("prediction-engine")

# --- FastAPI App ---
app = FastAPI(
    title="Speed WMS - AI Prediction Engine",
    description=(
        "AI による予測性補充マイクロサービス。\n"
        "指数平滑法で需要予測を行い、補充提案を返す。\n\n"
        "AI-powered Predictive Restock microservice.\n"
        "Uses Exponential Smoothing for demand forecasting."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS: Spring Boot (8080) と Vite dev server (5173) からのアクセスを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Endpoints
# ==========================================


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """ヘルスチェック / Health check"""
    return HealthResponse()


@app.get(
    "/api/v1/predictions/restock",
    response_model=List[RestockPrediction],
    tags=["Predictions"],
)
async def get_restock_predictions():
    """
    全商品の補充予測リストを返す。
    Return restock predictions for all products.
    """
    try:
        predictions = engine.predict_all()
        return predictions
    except Exception as e:
        logger.error(f"予測処理中にエラー / Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/api/v1/predictions/restock/{sku_code}",
    response_model=RestockPrediction,
    tags=["Predictions"],
)
async def get_restock_prediction_by_sku(sku_code: str):
    """
    特定 SKU の補充予測を返す。
    Return restock prediction for a specific SKU.
    """
    prediction = engine.predict_by_sku(sku_code)
    if prediction is None:
        raise HTTPException(
            status_code=404,
            detail=f"SKU '{sku_code}' の予測データが見つかりません / "
            f"No prediction found for SKU '{sku_code}'",
        )
    return prediction


@app.post(
    "/api/v1/predictions/refresh",
    response_model=RefreshResponse,
    tags=["Predictions"],
)
async def refresh_predictions():
    """
    予測モデルを再学習する（手動トリガー）。
    Manually trigger prediction model refresh.
    """
    try:
        count = engine.refresh()
        return RefreshResponse(
            success=True,
            message=f"予測モデルを更新しました / Model refreshed successfully",
            products_analyzed=count,
        )
    except Exception as e:
        logger.error(f"モデル更新失敗 / Model refresh failed: {e}")
        return RefreshResponse(
            success=False,
            message=f"更新失敗 / Refresh failed: {str(e)}",
        )


# ==========================================
# Future: Redis Pub/Sub Subscriber (リアルタイム予測)
# ==========================================
#
# import redis
# import json
# import asyncio
#
# async def start_redis_subscriber():
#     """
#     Redis Pub/Sub で出庫イベントを購読し、リアルタイム予測を実行する。
#     Subscribe to outbound scan events via Redis Pub/Sub for real-time prediction.
#     """
#     r = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT)
#     pubsub = r.pubsub()
#     pubsub.subscribe(settings.REDIS_CHANNEL_OUTBOUND)
#
#     for message in pubsub.listen():
#         if message["type"] == "message":
#             data = json.loads(message["data"])
#             barcode = data.get("barcode")
#             # リアルタイム再計算
#             prediction = engine.predict_by_sku_realtime(barcode)
#             if prediction:
#                 r.publish(
#                     settings.REDIS_CHANNEL_PREDICTION,
#                     json.dumps(prediction.model_dump())
#                 )
#
# @app.on_event("startup")
# async def startup_event():
#     """Redis subscriber をバックグラウンドタスクとして起動"""
#     asyncio.create_task(start_redis_subscriber())


# ==========================================
# Entry Point
# ==========================================

if __name__ == "__main__":
    logger.info(
        f"Speed WMS Prediction Engine starting on {settings.HOST}:{settings.PORT}"
    )
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level="info",
    )
