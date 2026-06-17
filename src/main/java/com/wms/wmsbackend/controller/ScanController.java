package com.wms.wmsbackend.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wms.wmsbackend.service.ScanService;

/**
 * スキャンデータコントローラー / 扫码数据控制器
 *
 * POST /api/scan/push  — 接收移动端扫描数据，通过 WebSocket 转发至 PC 端
 * POST /api/scan/undo  — 撤销上一次扫描
 * GET  /api/scan/logs  — 获取今日扫描日志列表
 *
 * /api/scan/** は SecurityConfig で permitAll 設定済み。
 * /api/scan/** 已在 SecurityConfig 中配置为 permitAll。
 */
@RestController
@RequestMapping("/api/scan")
public class ScanController {

    private static final Logger log = LoggerFactory.getLogger(ScanController.class);

    @Autowired
    private ScanService scanService;

    /** バーコードスキャンデータ受信 / 接收条码扫描数据 */
    @PostMapping("/push")
    public ResponseEntity<Map<String, Object>> pushScanData(@RequestBody Map<String, String> payload) {
        String barcode = payload.get("barcode");
        String userId  = payload.get("userId");

        if (barcode == null || barcode.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "barcode フィールドは必須です / barcode 字段不能为空"
            ));
        }

        log.info("スキャンデータ受信 / 接收到扫描数据: barcode={}, userId={}", barcode, userId);
        Map<String, Object> response = scanService.pushScanData(barcode, userId);
        return ResponseEntity.ok(response);
    }

    /** 直前スキャンの取り消し / 撤销上一次扫描 */
    @PostMapping("/undo")
    public ResponseEntity<Map<String, Object>> undoScanData(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        Map<String, Object> response = scanService.undoScanData(userId);

        // 取り消すログがない場合は 404 を返す / 无可撤销记录时返回 404
        if (!(Boolean) response.get("success")) {
            return ResponseEntity.status(404).body(response);
        }
        return ResponseEntity.ok(response);
    }

    /** スキャンログ取得 / 获取扫描日志 */
    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, Object>>> getScanLogs() {
        return ResponseEntity.ok(scanService.getScanLogs());
    }
}
