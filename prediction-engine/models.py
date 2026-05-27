"""
レスポンスモデル / Response Models
Speed WMS - AI Prediction Engine

FastAPI レスポンス用の Pydantic モデル。
Spring Boot の RestockSuggestionDto と互換。
"""
from pydantic import BaseModel, Field
from typing import Optional


class RestockPrediction(BaseModel):
    """
    補充予測レスポンス / Restock Prediction Response
    既存の RestockSuggestionDto と完全互換 + AI 拡張フィールド。
    """

    skuCode: str = Field(..., description="SKU コード")
    name: str = Field(..., description="商品名")
    currentStock: int = Field(0, description="現在庫数")
    dailyUsage: float = Field(0.0, description="実績ベースの日次使用量")
    predictedDailyUsage: float = Field(
        0.0, description="AI 予測の日次使用量 / AI-predicted daily usage"
    )
    leadTimeDays: int = Field(7, description="リードタイム（日数）")
    safetyStock: int = Field(10, description="安全在庫数")
    reorderPoint: int = Field(0, description="発注点")
    suggestedOrderQuantity: int = Field(0, description="推奨発注数量")
    daysUntilDepletion: int = Field(9999, description="在庫枯渇までの日数")
    predictedDepletionDate: str = Field("N/A", description="予測枯渇日")
    urgency: str = Field("Low", description="緊急度 (High/Medium/Low)")
    reason: str = Field("", description="アラート理由")

    # --- AI 拡張フィールド / AI Extension Fields ---
    confidenceScore: float = Field(
        0.0,
        ge=0.0,
        le=1.0,
        description="予測信頼度スコア (0.0〜1.0) / Prediction confidence score",
    )
    predictionSource: str = Field(
        "rule_based",
        description="予測ソース: 'ai_exponential_smoothing' or 'rule_based'",
    )


class HealthResponse(BaseModel):
    """ヘルスチェック応答 / Health check response"""

    status: str = "healthy"
    service: str = "speed-wms-prediction-engine"
    version: str = "1.0.0"


class RefreshResponse(BaseModel):
    """モデル更新応答 / Model refresh response"""

    success: bool
    message: str
    products_analyzed: int = 0
