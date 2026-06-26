"""
設定管理 / Configuration Management
Speed WMS - AI Prediction Engine

環境変数またはデフォルト値から設定を読み込む。
Loads configuration from environment variables or defaults.
"""
import os


class Settings:
    """アプリケーション設定 / Application Settings"""

    # --- Database (Read-Only Access) ---
    DB_HOST: str = os.getenv("WMS_DB_HOST", "127.0.0.1")
    DB_PORT: int = int(os.getenv("WMS_DB_PORT", "5432"))
    DB_NAME: str = os.getenv("WMS_DB_NAME", "wms_db")
    DB_USER: str = os.getenv("WMS_DB_USER", "root")
    DB_PASSWORD: str = os.getenv("WMS_DB_PASSWORD", "")

    # --- Prediction Parameters ---
    LOOKBACK_DAYS: int = int(os.getenv("LOOKBACK_DAYS", "90"))
    MIN_LOOKBACK_DAYS: int = int(os.getenv("MIN_LOOKBACK_DAYS", "14"))
    SMOOTHING_ALPHA: float = float(os.getenv("SMOOTHING_ALPHA", "0.3"))
    DEFAULT_LEAD_TIME: int = int(os.getenv("DEFAULT_LEAD_TIME", "7"))
    DEFAULT_SAFETY_STOCK: int = int(os.getenv("DEFAULT_SAFETY_STOCK", "10"))
    ORDER_HORIZON_DAYS: int = int(os.getenv("ORDER_HORIZON_DAYS", "30"))

    # --- Server ---
    HOST: str = os.getenv("ENGINE_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("ENGINE_PORT", "8000"))

    # --- Redis (Future: Pub/Sub リアルタイム予測) ---
    # REDIS_HOST: str = os.getenv("REDIS_HOST", "127.0.0.1")
    # REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    # REDIS_CHANNEL_OUTBOUND: str = "wms:scan:outbound"
    # REDIS_CHANNEL_PREDICTION: str = "wms:prediction:updated"


settings = Settings()
