"""
予測エンジン / Prediction Engine
Speed WMS - AI Prediction Engine

指数平滑法 (Exponential Smoothing) を用いた需要予測ロジック。
十分なデータがない場合はルールベースにフォールバック。
"""
import math
import logging
from datetime import date, timedelta
from typing import List, Dict, Optional

from config import settings
from models import RestockPrediction
import database

logger = logging.getLogger("predictor")


class PredictionEngine:
    """
    AI 予測エンジン / AI Prediction Engine

    指数平滑法 (Simple Exponential Smoothing) で日次使用量を予測する。
    スキャンデータが不十分な場合はルールベースにフォールバックする。
    """

    def __init__(self):
        self._cache: Optional[List[RestockPrediction]] = None
        self._last_refresh: Optional[date] = None

    def _exponential_smoothing(
        self, series: List[float], alpha: float
    ) -> tuple[float, float]:
        """
        単純指数平滑法を適用する。
        Apply Simple Exponential Smoothing.

        Returns:
            tuple: (predicted_value, confidence_score)
        """
        if not series:
            return 0.0, 0.0

        if len(series) == 1:
            return series[0], 0.3

        # 初期値はシリーズの最初の値
        smoothed = series[0]
        for val in series[1:]:
            smoothed = alpha * val + (1 - alpha) * smoothed

        # 信頼度スコア: データ量と変動係数に基づく
        # Confidence: based on data volume and coefficient of variation
        n = len(series)
        mean_val = sum(series) / n if n > 0 else 0
        if mean_val > 0:
            variance = sum((x - mean_val) ** 2 for x in series) / n
            cv = math.sqrt(variance) / mean_val  # 変動係数
            # データ量スコア (max 0.5) + 安定性スコア (max 0.5)
            data_score = min(n / settings.LOOKBACK_DAYS, 1.0) * 0.5
            stability_score = max(0.0, 1.0 - cv) * 0.5
            confidence = data_score + stability_score
        else:
            confidence = 0.1 if n >= settings.MIN_LOOKBACK_DAYS else 0.05

        return round(smoothed, 4), round(min(confidence, 1.0), 4)

    def _build_daily_series(
        self, daily_records: List[Dict], days: int
    ) -> List[float]:
        """
        日別スキャンレコードから連続的な日次系列を構築する。
        Build a continuous daily series from scan records, filling missing days with 0.
        """
        today = date.today()
        start_date = today - timedelta(days=days)

        # 日付をキーとしたマップを作成
        date_map: Dict[date, float] = {}
        for record in daily_records:
            d = record["scan_date"]
            if isinstance(d, str):
                d = date.fromisoformat(d)
            date_map[d] = float(record["daily_count"])

        # 連続する日次データに変換 (欠損日は 0)
        series = []
        current = start_date
        while current <= today:
            series.append(date_map.get(current, 0.0))
            current += timedelta(days=1)

        return series

    def predict_all(self) -> List[RestockPrediction]:
        """
        全商品の補充予測を実行する。
        Run restock predictions for all products.
        """
        try:
            products = database.fetch_all_products()
        except Exception as e:
            logger.error(f"DB からの商品取得に失敗 / Failed to fetch products: {e}")
            return []

        # 過去 N 日のバーコード別合計スキャン
        try:
            aggregate_scans = database.fetch_scan_history(settings.LOOKBACK_DAYS)
            scan_map = {
                row["barcode"]: float(row["scan_count"]) for row in aggregate_scans
            }
        except Exception as e:
            logger.error(f"スキャン履歴の取得に失敗 / Failed to fetch scan history: {e}")
            scan_map = {}

        today = date.today()
        predictions: List[RestockPrediction] = []

        for product in products:
            barcode = product.get("barcode") or ""
            sku_code = product.get("sku_code", "")
            name = product.get("name", "")
            current_stock = product.get("stock") or 0
            lead_time = product.get("lead_time_days") or settings.DEFAULT_LEAD_TIME
            safety_stock = product.get("safety_stock") or settings.DEFAULT_SAFETY_STOCK
            static_daily_usage = product.get("daily_usage") or 0.0

            # ルールベースの日次使用量 (既存ロジック互換)
            aggregate_count = scan_map.get(barcode, 0.0)
            rule_based_usage = aggregate_count / settings.LOOKBACK_DAYS

            # AI 予測: 日別時系列データがあれば指数平滑法を適用
            predicted_usage = rule_based_usage
            confidence = 0.0
            source = "rule_based"

            if barcode and aggregate_count >= settings.MIN_LOOKBACK_DAYS:
                try:
                    daily_records = database.fetch_daily_scan_series(
                        barcode, settings.LOOKBACK_DAYS
                    )
                    if daily_records and len(daily_records) >= 3:
                        series = self._build_daily_series(
                            daily_records, settings.LOOKBACK_DAYS
                        )
                        predicted_usage, confidence = self._exponential_smoothing(
                            series, settings.SMOOTHING_ALPHA
                        )
                        source = "ai_exponential_smoothing"
                except Exception as e:
                    logger.warning(
                        f"AI 予測失敗、ルールベースにフォールバック / "
                        f"AI prediction failed for {sku_code}, falling back: {e}"
                    )

            # 最終的な日次使用量: AI 予測 > 動的ルール > 静的設定値
            daily_usage = max(
                predicted_usage,
                rule_based_usage,
                static_daily_usage if static_daily_usage else 0.0,
            )

            # フィルタ: 使用量 0 で在庫が安全在庫超過の場合はスキップ
            if daily_usage <= 0.0 and current_stock > safety_stock:
                continue

            # 発注点計算
            reorder_point = int(math.ceil(daily_usage * lead_time + safety_stock))
            if current_stock > reorder_point:
                continue

            # 推奨発注数量
            suggested_order = int(
                math.ceil(
                    reorder_point
                    - current_stock
                    + daily_usage * settings.ORDER_HORIZON_DAYS
                )
            )
            suggested_order = max(suggested_order, safety_stock * 2)

            # 枯渇日数
            days_left = (
                int(math.floor(current_stock / daily_usage))
                if daily_usage > 0
                else 9999
            )
            depletion_date = (
                "N/A"
                if days_left >= 9999
                else (today + timedelta(days=days_left)).isoformat()
            )

            # 緊急度判定
            if current_stock == 0:
                urgency = "High"
                reason = "OUT OF STOCK / 在庫切れ"
            elif days_left <= lead_time:
                urgency = "High"
                reason = (
                    "リードタイム内に在庫切れ / "
                    "Stock will deplete within lead time"
                )
            elif current_stock <= safety_stock:
                urgency = "Medium"
                reason = "安全在庫を下回っています / Below safety stock"
            else:
                urgency = "Low"
                reason = "発注点に近づいています / Approaching reorder point"

            # AI 予測特有の理由付加
            if source == "ai_exponential_smoothing" and predicted_usage > rule_based_usage * 1.1:
                reason += " | AI予測: 需要増加傾向 / AI: Demand trending up"

            predictions.append(
                RestockPrediction(
                    skuCode=sku_code,
                    name=name,
                    currentStock=current_stock,
                    dailyUsage=round(rule_based_usage, 2),
                    predictedDailyUsage=round(predicted_usage, 2),
                    leadTimeDays=lead_time,
                    safetyStock=safety_stock,
                    reorderPoint=reorder_point,
                    suggestedOrderQuantity=suggested_order,
                    daysUntilDepletion=days_left,
                    predictedDepletionDate=depletion_date,
                    urgency=urgency,
                    reason=reason,
                    confidenceScore=round(confidence, 2),
                    predictionSource=source,
                )
            )

        # キャッシュ更新
        self._cache = predictions
        self._last_refresh = today

        logger.info(
            f"予測完了: {len(predictions)} 件のアラート / "
            f"Prediction complete: {len(predictions)} alerts from {len(products)} products"
        )
        return predictions

    def predict_by_sku(self, sku_code: str) -> Optional[RestockPrediction]:
        """
        特定 SKU の予測を返す。キャッシュがあればそこから取得。
        Return prediction for a specific SKU.
        """
        if self._cache is None:
            self.predict_all()
        if self._cache:
            for p in self._cache:
                if p.skuCode == sku_code:
                    return p
        return None

    def refresh(self) -> int:
        """
        予測モデルを再学習する（キャッシュをクリアして再計算）。
        Refresh prediction model (clear cache and recalculate).

        Returns:
            int: 分析された商品数
        """
        self._cache = None
        predictions = self.predict_all()
        return len(predictions)


# シングルトンインスタンス / Singleton instance
engine = PredictionEngine()
