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

import jakarta.annotation.security.PermitAll;

/**
 * スキャンデータコントローラー / 扫码数据控制器
 * モバイル端末からのバーコードスキャンを受信し WebSocket で PC に中継する。
 * 接收移动端扫描数据，通过 WebSocket 转发至 PC 端。
 * CORS は SecurityConfig でグローバル設定済み。/ CORS 已在 SecurityConfig 全局配置。
 */
@RestController
@RequestMapping("/api/scan")
public class ScanController {

    private static final Logger log = LoggerFactory.getLogger(ScanController.class);

    @Autowired
    private ScanService scanService;

    /** バーコードスキャンデータ受信 / 接收条码扫描数据 */
    @PermitAll
    @PostMapping("/push")
    public ResponseEntity<Map<String, Object>> pushScanData(@RequestBody Map<String, String> payload) {
        String barcode = payload.get("barcode");
        String userId = payload.get("userId");
        log.info("スキャンデータ受信 / 接收到扫描数据: barcode={}, userId={}", barcode, userId);
        Map<String, Object> response = scanService.pushScanData(barcode, userId);
        return ResponseEntity.ok(response);
    }

    /** 直前スキャンの取り消し / 撤销上一次扫描 */
    @PermitAll
    @PostMapping("/undo")
    public ResponseEntity<Map<String, Object>> undoScanData(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        Map<String, Object> response = scanService.undoScanData(userId);
        return ResponseEntity.ok(response);
    }

    /** スキャンログ取得 / 获取扫描日志 */
    @PermitAll
    @GetMapping("/logs")
    public List<Map<String, Object>> getScanLogs() {
        return scanService.getScanLogs();
    }
}
