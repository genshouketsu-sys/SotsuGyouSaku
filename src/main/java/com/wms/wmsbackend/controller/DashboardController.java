package com.wms.wmsbackend.controller;

import com.wms.wmsbackend.mapper.ProductMapper;
import com.wms.wmsbackend.mapper.ScanLogMapper;
import com.wms.wmsbackend.service.RestockPredictionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * ダッシュボード統計コントローラー / 仪表板统计控制器
 *
 * GET /api/dashboard/stats — 返回实时统计数据
 *   响应字段：totalActiveSKUs, scansToday, lowStockAlerts, timestamp
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final Logger log = LoggerFactory.getLogger(DashboardController.class);

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ScanLogMapper scanLogMapper;

    @Autowired
    private RestockPredictionService predictionService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        try {
            stats.put("totalActiveSKUs",  productMapper.countActiveSKUs());
            stats.put("scansToday",       scanLogMapper.countScansToday());
            stats.put("lowStockAlerts",   predictionService.getRestockSuggestions().size());
            stats.put("timestamp",        Instant.now().toString());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("ダッシュボード統計の取得に失敗しました / 获取仪表板统计失败", e);
            stats.put("error", "統計情報の取得に失敗しました / 统计信息获取失败");
            stats.put("timestamp", Instant.now().toString());
            return ResponseEntity.internalServerError().body(stats);
        }
    }
}
