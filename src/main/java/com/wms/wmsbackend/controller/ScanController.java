package com.wms.wmsbackend.controller;

import com.wms.wmsbackend.config.ScanWebSocketHandler;
import jakarta.annotation.security.PermitAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/scan")
@CrossOrigin(origins = "*") 
public class ScanController {

    @Autowired
    private ScanWebSocketHandler scanWebSocketHandler;

    @Autowired
    private com.wms.wmsbackend.mapper.ScanLogMapper scanLogMapper;

    @PermitAll
    @PostMapping("/push")
    public ResponseEntity<Map<String, Object>> pushScanData(@RequestBody Map<String, String> payload) {
        String barcode = payload.get("barcode");
        String userId = payload.get("userId");
        System.out.println("Received scan push: barcode=" + barcode + ", userId=" + userId);

        try {
            scanLogMapper.insert(barcode, userId);
        } catch (Exception e) {
            System.err.println("Failed to log scan: " + e.getMessage());
        }

        String targetClientId = "pc_" + userId;
        scanWebSocketHandler.sendMessageToClient(targetClientId, barcode);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Relay request processed");
        return ResponseEntity.ok(response);
    }

    @PermitAll
    @GetMapping("/logs")
    public List<Map<String, Object>> getScanLogs() {
        return scanLogMapper.findAllLogs();
    }
}