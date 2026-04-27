package com.wms.wmsbackend.controller;

import com.wms.wmsbackend.config.ScanWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/scan")
@CrossOrigin(origins = "*") // 允许移动端跨域访问
public class ScanController {

    @Autowired
    private ScanWebSocketHandler scanWebSocketHandler;

    @PostMapping("/push")
    public ResponseEntity<Map<String, Object>> pushScanData(@RequestBody Map<String, String> payload) {
        String barcode = payload.get("barcode");
        String userId = payload.get("userId"); // 移动端传来的 userId，例如 "1"

        // 根据您的移动端和 PC 端对应规则，将 userId "1" 映射到 clientId "pc_1"
        String targetClientId = "pc_" + userId;

        // 将条码通过 WebSocket 推送给对应的 PC 端
        scanWebSocketHandler.sendMessageToClient(targetClientId, barcode);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "中继请求已处理 (Relay request processed)");
        return ResponseEntity.ok(response);
    }
}