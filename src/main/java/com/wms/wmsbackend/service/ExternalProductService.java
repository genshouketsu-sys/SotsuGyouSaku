package com.wms.wmsbackend.service;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * 外部商品情報サービス（Yahoo! Shopping API 連携）/ 外部商品信息服务（对接 Yahoo! 购物 API）
 * バーコードで Yahoo! Shopping API を検索し商品名・画像を取得する。
 * 通过条码查询 Yahoo! 购物 API，获取商品名称和图片。
 */
@Service
public class ExternalProductService {

    private static final Logger log = LoggerFactory.getLogger(ExternalProductService.class);

    /** Yahoo! Shopping App ID。application.yml または環境変数で設定する。/ 在 application.yml 或环境变量中配置。 */
    @Value("${yahoo.appid:}")
    private String appId;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Yahoo! Shopping API からバーコードで商品情報を取得する。
     * 通过 Yahoo! 购物 API 按条码查询商品信息。
     *
     * @param barcode JAN コード / JAN 码
     * @return name（商品名）, image（画像 URL）を含むマップ / 包含 name 和 image 的 Map
     */
    public Map<String, String> fetchFromYahoo(String barcode) {
        Map<String, String> result = new HashMap<>();
        result.put("name", "Unknown Product");
        result.put("image", "");

        if (appId == null || appId.isBlank()) {
            log.warn("Yahoo App ID が未設定です。外部検索をスキップします。/ Yahoo App ID 未配置，跳过外部查询。");
            return result;
        }

        String url = String.format(
                "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=%s&jan=%s",
                appId, barcode);

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode hits = root.path("hits");
            if (hits.isArray() && !hits.isEmpty()) {
                JsonNode firstHit = hits.get(0);
                result.put("name", firstHit.path("name").asText());
                result.put("image", firstHit.path("image").path("medium").asText());
            }
        } catch (Exception e) {
            log.error("Yahoo API 呼び出しに失敗しました / Yahoo API 调用失败: barcode={}, error={}", barcode, e.getMessage(), e);
        }

        return result;
    }
}
