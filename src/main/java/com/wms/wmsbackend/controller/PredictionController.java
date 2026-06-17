package com.wms.wmsbackend.controller;

import com.wms.wmsbackend.dto.RestockSuggestionDto;
import com.wms.wmsbackend.service.AiPredictionClient;
import com.wms.wmsbackend.service.RestockPredictionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 補充予測コントローラー / 补货预测控制器
 *
 * GET  /api/predictions/restock    — AI優先 → ルールベースフォールバック
 * GET  /api/predictions/restock/ai — AI専用（フォールバックなし）
 * POST /api/predictions/refresh    — AIモデル再学習トリガー
 *
 * AI 予測エンジン (Python) を優先し、失敗時はルールベース (Java) にフォールバック。
 * Prioritizes AI prediction engine (Python), falls back to rule-based (Java) on failure.
 */
@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    private static final Logger log = LoggerFactory.getLogger(PredictionController.class);

    @Autowired
    private AiPredictionClient aiPredictionClient;

    @Autowired
    private RestockPredictionService fallbackService;

    /**
     * 補充予測リスト (AI 優先 → フォールバック)
     * Restock predictions with AI priority and rule-based fallback.
     */
    @GetMapping("/restock")
    public ResponseEntity<List<RestockSuggestionDto>> getRestockSuggestions() {
        try {
            return ResponseEntity.ok(aiPredictionClient.getRestockSuggestions());
        } catch (Exception e) {
            log.error("補充予測取得に失敗しました / 获取补货预测失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * AI 予測エンジン専用エンドポイント
     * AI engine only endpoint (no fallback).
     */
    @GetMapping("/restock/ai")
    public ResponseEntity<List<RestockSuggestionDto>> getAiPredictions() {
        try {
            return ResponseEntity.ok(aiPredictionClient.getAiPredictions());
        } catch (Exception e) {
            log.error("AI予測取得に失敗しました / 获取 AI 预测失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * AI モデル再学習トリガー
     * Trigger AI model refresh.
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshModel() {
        boolean success = aiPredictionClient.refreshModel();
        return ResponseEntity.ok(Map.of(
            "success", success,
            "message", success
                ? "AI モデルを更新しました / AI model refreshed successfully"
                : "AI モデル更新に失敗しました / AI model refresh failed"
        ));
    }
}
