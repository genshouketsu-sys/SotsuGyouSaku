package com.wms.wmsbackend.controller;

import com.wms.wmsbackend.dto.RestockSuggestionDto;
import com.wms.wmsbackend.service.AiPredictionClient;
import com.wms.wmsbackend.service.RestockPredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 補充予測コントローラー / Restock Prediction Controller
 *
 * AI 予測エンジン (Python) を優先し、失敗時はルールベース (Java) にフォールバック。
 * Prioritizes AI prediction engine (Python), falls back to rule-based (Java) on failure.
 */
@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @Autowired
    private AiPredictionClient aiPredictionClient;

    @Autowired
    private RestockPredictionService fallbackService;

    /**
     * 補充予測リスト (AI 優先 → フォールバック)
     * Restock predictions with AI priority and rule-based fallback.
     */
    @GetMapping("/restock")
    public List<RestockSuggestionDto> getRestockSuggestions() {
        return aiPredictionClient.getRestockSuggestions();
    }

    /**
     * AI 予測エンジン専用エンドポイント
     * AI engine only endpoint (no fallback).
     */
    @GetMapping("/restock/ai")
    public List<RestockSuggestionDto> getAiPredictions() {
        return aiPredictionClient.getAiPredictions();
    }

    /**
     * AI モデル再学習トリガー
     * Trigger AI model refresh.
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshModel() {
        Map<String, Object> response = new HashMap<>();
        boolean success = aiPredictionClient.refreshModel();
        response.put("success", success);
        response.put("message", success
            ? "AI モデルを更新しました / AI model refreshed"
            : "AI モデル更新に失敗しました / AI model refresh failed");
        return ResponseEntity.ok(response);
    }
}
