-- =============================================================================
-- Speed WMS — Operator Chat テーブル定義
-- オペレーター間リアルタイムチャット用のメッセージ永続化テーブル
-- 操作员间实时聊天消息持久化表
-- =============================================================================

CREATE TABLE IF NOT EXISTS wms_operator_messages (
    id           BIGSERIAL     NOT NULL,
    sender_id    BIGINT        NOT NULL,
    content      TEXT          NOT NULL,
    message_type VARCHAR(20)   NOT NULL DEFAULT 'TEXT',
    created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_chat_sender
        FOREIGN KEY (sender_id)
        REFERENCES wms_user (id)
        ON DELETE CASCADE
);

-- パフォーマンスインデックス / 性能索引
-- 時系列クエリ用（チャット履歴のページネーション）/ 时间序列查询（聊天记录分页）
CREATE INDEX IF NOT EXISTS idx_chat_created_at
    ON wms_operator_messages (created_at DESC);

-- 送信者別フィルタリング用 / 按发送者筛选
CREATE INDEX IF NOT EXISTS idx_chat_sender_id
    ON wms_operator_messages (sender_id);
