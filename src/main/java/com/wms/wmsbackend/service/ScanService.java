package com.wms.wmsbackend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wms.wmsbackend.config.ScanWebSocketHandler;
import com.wms.wmsbackend.entity.Product;
import com.wms.wmsbackend.mapper.ProductMapper;
import com.wms.wmsbackend.mapper.ScanLogMapper;

/**
 * スキャンサービス / 扫描服务
 * バーコードスキャンデータの処理・ログ記録・WebSocket 中継を担当する。
 * 负责条码扫描数据的处理、日志记录和 WebSocket 转发。
 */
@Service
public class ScanService {

    private static final Logger log = LoggerFactory.getLogger(ScanService.class);

    @Autowired
    private ScanLogMapper scanLogMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ExternalProductService externalProductService;

    @Autowired
    private ScanWebSocketHandler scanWebSocketHandler;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * スキャンデータを受信して WebSocket で PC に中継する。
     * 接收扫描数据并通过 WebSocket 转发至 PC 端。
     */
    public Map<String, Object> pushScanData(String barcode, String userId) {
        String productName = "Unknown Product";
        String productImage = "";

        Product localProduct = productMapper.findByBarcode(barcode);
        if (localProduct != null) {
            productName = localProduct.getName();
        } else {
            Map<String, String> yahooData = externalProductService.fetchFromYahoo(barcode);
            productName = yahooData.get("name");
            productImage = yahooData.get("image");
        }

        // スキャンログを記録 / 记录扫描日志
        try {
            scanLogMapper.insert(barcode, userId);
        } catch (Exception e) {
            log.error("スキャンログの記録に失敗しました / 扫描日志记录失败: {}", e.getMessage(), e);
        }

        // ═══════════════════════════════════════════════════════════════
        // Future: Redis Pub/Sub リアルタイム予測フックポイント
        // 出庫スキャン時に Redis チャネルへ publish し、
        // Python AI エンジンがリアルタイムで需要予測を再計算する。
        //
        // @Autowired private StringRedisTemplate redisTemplate;
        //
        // Map<String, String> event = Map.of(
        //     "barcode", barcode,
        //     "userId", userId,
        //     "timestamp", LocalDateTime.now().toString()
        // );
        // redisTemplate.convertAndSend("wms:scan:outbound",
        //     objectMapper.writeValueAsString(event));
        // ═══════════════════════════════════════════════════════════════

        // WebSocket で PC に中継 / 通过 WebSocket 向 PC 推送消息
        String targetClientId = "pc_" + userId;
        Map<String, String> wsMessage = new HashMap<>();
        wsMessage.put("barcode", barcode);
        wsMessage.put("name", productName);
        wsMessage.put("image", productImage);

        try {
            String jsonMessage = objectMapper.writeValueAsString(wsMessage);
            scanWebSocketHandler.sendMessageToClient(targetClientId, jsonMessage);
        } catch (Exception e) {
            log.warn("JSON シリアライズに失敗。フォールバック送信 / JSON 序列化失败，降级发送原始数据: {}", e.getMessage());
            scanWebSocketHandler.sendMessageToClient(targetClientId, barcode);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "中継処理完了 / 中继处理完成");
        return response;
    }

    /**
     * 直前のスキャンを取り消す。/ 撤销上一次扫描操作。
     */
    public Map<String, Object> undoScanData(String userId) {
        Map<String, Object> response = new HashMap<>();
        Long latestId = scanLogMapper.findLatestIdByUserId(userId);
        if (latestId != null) {
            scanLogMapper.deleteById(latestId);
            String targetClientId = "pc_" + userId;
            scanWebSocketHandler.sendMessageToClient(targetClientId, "UNDO_LAST_ACTION");
            response.put("success", true);
            response.put("message", "最後のスキャンを取り消しました / 已撤销最后一次扫描");
        } else {
            response.put("success", false);
            response.put("message", "取り消すログがありません / 没有可撤销的日志");
        }
        return response;
    }

    /**
     * スキャンログ一覧を取得する。/ 获取扫描日志列表。
     */
    public List<Map<String, Object>> getScanLogs() {
        return scanLogMapper.findAllLogs();
    }
}
