package com.wms.wmsbackend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wms.wmsbackend.dto.RestockSuggestionDto;
import com.wms.wmsbackend.entity.Product;
import com.wms.wmsbackend.mapper.ScanLogMapper;

/**
 * 補充予測サービス / 补货预测服务
 * 過去14日間のスキャン実績を基に動的な日次使用量を算出し、補充が必要な商品を返す。
 * 基于过去14天的扫描数据动态计算日均使用量，并返回需要补货的商品列表。
 */
@Service
public class RestockPredictionService {

    private static final int LOOKBACK_DAYS = 14;

    @Autowired
    private ProductService productService;

    @Autowired
    private ScanLogMapper scanLogMapper;

    /**
     * 補充提案リストを取得する。/ 获取补货建议列表。
     *
     * @return 補充が必要な商品の提案リスト / 需要补货的商品建议列表
     */
    public List<RestockSuggestionDto> getRestockSuggestions() {
        List<Product> products = productService.getAllProducts();
        List<RestockSuggestionDto> suggestions = new ArrayList<>();

        // 過去14日間のバーコード別スキャン集計 / 统计过去14天各条码的扫描次数
        List<Map<String, Object>> recentScans = scanLogMapper.getRecentScanCounts(LOOKBACK_DAYS);
        Map<String, Double> dynamicUsageMap = new HashMap<>();
        for (Map<String, Object> entry : recentScans) {
            String barcode = (String) entry.get("barcode");
            // MyBatis の COUNT(*) は Long, BigDecimal, Integer 等を返し得るため Number で安全に変換
            // MyBatis COUNT(*) 结果可能是 Long/BigDecimal/Integer，使用 Number 安全转换
            Number count = (Number) entry.get("scanCount");
            dynamicUsageMap.put(barcode, count.doubleValue() / LOOKBACK_DAYS);
        }

        LocalDate today = LocalDate.now();

        for (Product product : products) {
            // 優先度: 動的使用量 > 静的設定値 > 0 / 优先级: 动态使用量 > 静态设定值 > 0
            double dailyUsage = dynamicUsageMap.getOrDefault(
                    product.getBarcode(),
                    product.getDailyUsage() != null ? product.getDailyUsage() : 0.0);

            int leadTime = product.getLeadTimeDays() != null ? product.getLeadTimeDays() : 7;
            int safetyStock = product.getSafetyStock() != null ? product.getSafetyStock() : 10;
            int currentStock = product.getStock() != null ? product.getStock() : 0;

            if (dailyUsage <= 0.0 && currentStock > safetyStock) {
                continue;
            }

            int reorderPoint = (int) Math.ceil(dailyUsage * leadTime + safetyStock);
            if (currentStock > reorderPoint) {
                continue;
            }

            RestockSuggestionDto dto = new RestockSuggestionDto();
            dto.setSkuCode(product.getSkuCode());
            dto.setName(product.getName());
            dto.setCurrentStock(currentStock);
            dto.setDailyUsage(dailyUsage);
            dto.setLeadTimeDays(leadTime);
            dto.setSafetyStock(safetyStock);
            dto.setReorderPoint(reorderPoint);

            // 補充数量 = 発注点 - 現在庫 + 30日分 / 补货量 = 发货点 - 现有库存 + 30天消耗量
            int suggestedOrder = (int) Math.ceil(reorderPoint - currentStock + dailyUsage * 30);
            dto.setSuggestedOrderQuantity(Math.max(suggestedOrder, safetyStock * 2));

            // dailyUsage が 0 の場合は在庫が減らないため大きな値にする / 无消耗时不会耗尽
            int daysLeft = dailyUsage > 0 ? (int) Math.floor(currentStock / dailyUsage) : 9999;
            dto.setDaysUntilDepletion(daysLeft);
            dto.setPredictedDepletionDate(daysLeft >= 9999 ? "N/A" : today.plusDays(daysLeft).toString());

            // 緊急度判定 / 紧急度判断
            if (currentStock == 0) {
                dto.setUrgency("High");
                dto.setReason("OUT OF STOCK");
            } else if (daysLeft <= leadTime) {
                dto.setUrgency("High");
                dto.setReason("リードタイム内に在庫切れ / 在补货周期内库存耗尽");
            } else if (currentStock <= safetyStock) {
                dto.setUrgency("Medium");
                dto.setReason("安全在庫を下回っています / 低于安全库存");
            } else {
                dto.setUrgency("Low");
                dto.setReason("発注点に近づいています / 接近再订货点");
            }

            suggestions.add(dto);
        }

        return suggestions;
    }
}
