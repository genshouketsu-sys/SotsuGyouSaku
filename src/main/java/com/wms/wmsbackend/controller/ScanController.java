package com.wms.wmsbackend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wms.wmsbackend.service.ScanService;

import jakarta.annotation.security.PermitAll;

@RestController
@RequestMapping("/api/scan")
@CrossOrigin(origins = "*")
public class ScanController {

    @Autowired
    private ScanService scanService;

    @PermitAll
    @PostMapping("/push")
    public ResponseEntity<Map<String, Object>> pushScanData(@RequestBody Map<String, String> payload) {
        String barcode = payload.get("barcode");
        String userId = payload.get("userId");
        System.out.println("Received scan push: barcode=" + barcode + ", userId=" + userId);

        Map<String, Object> response = scanService.pushScanData(barcode, userId);
        return ResponseEntity.ok(response);
    }

    @PermitAll
    @PostMapping("/undo")
    public ResponseEntity<Map<String, Object>> undoScanData(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        Map<String, Object> response = scanService.undoScanData(userId);
        return ResponseEntity.ok(response);
    }

    @PermitAll
    @GetMapping("/logs")
    public List<Map<String, Object>> getScanLogs() {
        return scanService.getScanLogs();
    }
}
