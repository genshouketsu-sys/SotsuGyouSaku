package com.wms.wmsbackend.chat.mapper;

import com.wms.wmsbackend.chat.entity.OperatorMessage;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * チャットメッセージ MyBatis マッパー / 聊天消息 MyBatis Mapper
 *
 * <p>既存の Mapper（ProductMapper, UserMapper 等）と同じアノテーションベースパターンを使用。
 * <p>使用与现有 Mapper（ProductMapper, UserMapper 等）相同的注解模式。
 */
@Mapper
public interface ChatMessageMapper {

    /**
     * メッセージを新規保存する / 保存新消息
     *
     * @param message 保存するメッセージ / 要保存的消息
     * @return 影響行数 / 影响行数
     */
    @Insert("INSERT INTO wms_operator_messages (sender_id, content, message_type, created_at) " +
            "VALUES (#{senderId}, #{content}, #{messageType}, #{createdAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(OperatorMessage message);

    /**
     * 最新 N 件のメッセージを取得する（送信者情報を JOIN）/ 获取最近 N 条消息（JOIN 发送者信息）
     *
     * <p>DESC で取得した後、アプリケーション側で ASC に並べ替える。
     * <p>先按 DESC 获取，再在应用层反转为 ASC。
     *
     * @param limit 取得件数 / 获取条数
     * @return メッセージリスト（新しい順）/ 消息列表（最新在前）
     */
    @Select("SELECT m.id, m.sender_id, m.content, m.message_type, m.created_at, " +
            "       u.display_name AS sender_display_name, " +
            "       u.username     AS sender_username, " +
            "       u.avatar_url   AS sender_avatar_url " +
            "FROM wms_operator_messages m " +
            "JOIN wms_user u ON m.sender_id = u.id " +
            "ORDER BY m.created_at DESC " +
            "LIMIT #{limit}")
    @Results({
            @Result(property = "id",                column = "id"),
            @Result(property = "senderId",          column = "sender_id"),
            @Result(property = "content",           column = "content"),
            @Result(property = "messageType",       column = "message_type"),
            @Result(property = "createdAt",         column = "created_at"),
            @Result(property = "senderDisplayName", column = "sender_display_name"),
            @Result(property = "senderUsername",     column = "sender_username"),
            @Result(property = "senderAvatarUrl",   column = "sender_avatar_url")
    })
    List<OperatorMessage> findRecentMessages(@Param("limit") int limit);

    /**
     * 指定 ID より前（古い）メッセージを N 件取得する（無限スクロール用）
     * 获取指定 ID 之前（更早）的 N 条消息（无限滚动用）
     *
     * @param beforeId この ID より小さいメッセージ / 小于此 ID 的消息
     * @param limit    取得件数 / 获取条数
     * @return メッセージリスト（新しい順）/ 消息列表（最新在前）
     */
    @Select("SELECT m.id, m.sender_id, m.content, m.message_type, m.created_at, " +
            "       u.display_name AS sender_display_name, " +
            "       u.username     AS sender_username, " +
            "       u.avatar_url   AS sender_avatar_url " +
            "FROM wms_operator_messages m " +
            "JOIN wms_user u ON m.sender_id = u.id " +
            "WHERE m.id < #{beforeId} " +
            "ORDER BY m.created_at DESC " +
            "LIMIT #{limit}")
    @Results({
            @Result(property = "id",                column = "id"),
            @Result(property = "senderId",          column = "sender_id"),
            @Result(property = "content",           column = "content"),
            @Result(property = "messageType",       column = "message_type"),
            @Result(property = "createdAt",         column = "created_at"),
            @Result(property = "senderDisplayName", column = "sender_display_name"),
            @Result(property = "senderUsername",     column = "sender_username"),
            @Result(property = "senderAvatarUrl",   column = "sender_avatar_url")
    })
    List<OperatorMessage> findMessagesBefore(@Param("beforeId") Long beforeId, @Param("limit") int limit);
}
