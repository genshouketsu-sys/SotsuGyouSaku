package com.wms.wmsbackend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wms.wmsbackend.config.ScanWebSocketHandler;
import com.wms.wmsbackend.entity.Product;
import com.wms.wmsbackend.mapper.ProductMapper;
import com.wms.wmsbackend.mapper.ScanLogMapper;

@Service
public class ScanService {

    @Autowired
    private ScanLogMapper scanLogMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ExternalProductService externalProductService;

    @Autowired
    private ScanWebSocketHandler scanWebSocketHandler;

    public Map<String, Object> pushScanData(String barcode, String userId) {
        // Resolve Product Name and Image
        String productName = "Unknown Product";
        String productImage = "";

        Product localProduct = productMapper.findByBarcode(barcode);
        if (localProduct != null) {
            productName = localProduct.getName();
            // Assuming localProduct has image or just generic
        } else {
            Map<String, String> yahooData = externalProductService.fetchFromYahoo(barcode);
            productName = yahooData.get("name");
            productImage = yahooData.get("image");
        }

        // Insert scan log
        try {
            scanLogMapper.insert(barcode, userId);
        } catch (Exception e) {
            System.err.println("Failed to log scan: " + e.getMessage());
        }

        // Send WebSocket message to PC
        String targetClientId = "pc_" + userId;
        Map<String, String> wsMessage = new HashMap<>();
        wsMessage.put("barcode", barcode);
        wsMessage.put("name", productName);
        wsMessage.put("image", productImage);

        try {
            String jsonMessage = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(wsMessage);
            scanWebSocketHandler.sendMessageToClient(targetClientId, jsonMessage);
        } catch (Exception e) {
            scanWebSocketHandler.sendMessageToClient(targetClientId, barcode); // Fallback
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Relay processed with product info");
        return response;
    }

    public Map<String, Object> undoScanData(String userId) {
        Map<String, Object> response = new HashMap<>();

        Long latestId = scanLogMapper.findLatestIdByUserId(userId);
        if (latestId != null) {
            scanLogMapper.deleteById(latestId);

            // Notify PC client to undo
            String targetClientId = "pc_" + userId;
            scanWebSocketHandler.sendMessageToClient(targetClientId, "UNDO_LAST_ACTION");

            response.put("success", true);
            response.put("message", "Last scan undone");
        } else {
            response.put("success", false);
            response.put("message", "No logs to undo");
        }
        return response;
    }

    public List<Map<String, Object>> getScanLogs() {
        return scanLogMapper.findAllLogs();
    }
}
