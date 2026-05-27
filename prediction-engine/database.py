"""
データベース接続 / Database Connection
Speed WMS - AI Prediction Engine

MySQL に読み取り専用でアクセスし、商品・スキャン履歴を取得する。
Read-only access to MySQL to fetch products and scan history.
"""
import pymysql
from contextlib import contextmanager
from typing import List, Dict, Any

from config import settings


@contextmanager
def get_connection():
    """
    MySQL 接続のコンテキストマネージャー。
    Context manager for MySQL connections.
    """
    conn = pymysql.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=5,
        read_timeout=10,
    )
    try:
        yield conn
    finally:
        conn.close()


def fetch_all_products() -> List[Dict[str, Any]]:
    """
    全商品を取得する / Fetch all products.
    """
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, sku_code, name, barcode, stock, "
                "daily_usage, lead_time_days, safety_stock, create_time "
                "FROM product ORDER BY create_time DESC"
            )
            return cursor.fetchall()


def fetch_scan_history(days: int) -> List[Dict[str, Any]]:
    """
    指定日数のスキャン履歴をバーコード別に集計する。
    Aggregate scan history by barcode for the given number of days.
    """
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT barcode, COUNT(*) as scan_count "
                "FROM wms_scan_log "
                "WHERE scan_time >= DATE_SUB(NOW(), INTERVAL %s DAY) "
                "GROUP BY barcode",
                (days,),
            )
            return cursor.fetchall()


def fetch_daily_scan_series(barcode: str, days: int) -> List[Dict[str, Any]]:
    """
    特定バーコードの日別スキャン数を取得する（時系列予測用）。
    Fetch daily scan counts for a specific barcode (for time-series prediction).
    """
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT DATE(scan_time) as scan_date, COUNT(*) as daily_count "
                "FROM wms_scan_log "
                "WHERE barcode = %s AND scan_time >= DATE_SUB(NOW(), INTERVAL %s DAY) "
                "GROUP BY DATE(scan_time) "
                "ORDER BY scan_date ASC",
                (barcode, days),
            )
            return cursor.fetchall()
