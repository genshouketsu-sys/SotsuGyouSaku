package com.wms.wmsbackend.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.wms.wmsbackend.dto.RestockSuggestionDto;

/**
 * AI 予測エンジンクライアント / AI Prediction Engine Client
 *
 * Python (FastAPI) マイクロサービスへの HTTP クライアント。
 * サービスダウン時は既存の RestockPredictionService にフォールバックする。
 *
 * HTTP client for the Python (FastAPI) prediction microservice.
 * Falls back to the existing RestockPredictionService when the AI service is unavailable.
 *
 * 将来: Redis Pub/Sub によるリアルタイム予測に移行予定。
 * Future: Will migrate to real-time prediction via Redis Pub/Sub.
 */
@Service
public class AiPredictionClient {

    private static final Logger log = LoggerFactory.getLogger(AiPredictionClient.class);

    @Value("${ai.prediction-engine.base-url:http://127.0.0.1:8000}")
    private String baseUrl;

    @Value("${ai.prediction-engine.enabled:true}")
    private boolean enabled;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private RestockPredictionService fallbackService;

    /**
     * AI 予測優先で補充提案を取得する。失敗時はルールベースにフォールバック。
     * Get restock suggestions with AI priority. Falls back to rule-based on failure.
     *
     * @return 補充提案リスト / List of restock suggestions
     */
    public List<RestockSuggestionDto> getRestockSuggestions() {
        if (!enabled) {
            log.debug("AI 予測エンジンは無効です。ルールベースを使用します / AI engine disabled, using rule-based");
            return addSourceMetadata(fallbackService.getRestockSuggestions(), "rule_based");
        }

        try {
            String url = baseUrl + "/api/v1/predictions/restock";
            log.debug("AI 予測エンジンに問い合わせ中 / Querying AI engine: {}", url);

            ResponseEntity<List<RestockSuggestionDto>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<RestockSuggestionDto>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("AI 予測エンジンから {} 件の提案を取得 / Got {} suggestions from AI engine",
                    response.getBody().size(), response.getBody().size());
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("AI 予測エンジンに接続できません。フォールバック実行 / AI engine unavailable, falling back: {}",
                e.getMessage());
        }

        // フォールバック: 既存のルールベースロジック
        return addSourceMetadata(fallbackService.getRestockSuggestions(), "rule_based");
    }

    /**
     * AI 予測エンジン専用の呼び出し（フォールバックなし）。
     * Direct AI engine call without fallback.
     *
     * @return AI 予測リスト or 空リスト / AI predictions or empty list
     */
    public List<RestockSuggestionDto> getAiPredictions() {
        if (!enabled) {
            return Collections.emptyList();
        }

        try {
            String url = baseUrl + "/api/v1/predictions/restock";
            ResponseEntity<List<RestockSuggestionDto>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<RestockSuggestionDto>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("AI 予測エンジンに接続できません / AI engine unavailable: {}", e.getMessage());
        }

        return Collections.emptyList();
    }

    /**
     * AI モデルの再学習をトリガーする。
     * Trigger AI model refresh.
     *
     * @return 成功時 true / true on success
     */
    public boolean refreshModel() {
        if (!enabled) {
            return false;
        }

        try {
            String url = baseUrl + "/api/v1/predictions/refresh";
            ResponseEntity<String> response = restTemplate.postForEntity(url, null, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("AI モデル更新に失敗 / AI model refresh failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * ルールベース結果にソースメタデータを付加する。
     * Add source metadata to rule-based results.
     */
    private List<RestockSuggestionDto> addSourceMetadata(List<RestockSuggestionDto> suggestions, String source) {
        for (RestockSuggestionDto dto : suggestions) {
            if (dto.getPredictionSource() == null) {
                dto.setPredictionSource(source);
            }
            if (dto.getConfidenceScore() == null) {
                dto.setConfidenceScore(0.0);
            }
        }
        return suggestions;
    }
}
