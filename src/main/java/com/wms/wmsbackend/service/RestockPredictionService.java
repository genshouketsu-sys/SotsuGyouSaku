package com.wms.wmsbackend.service;

import com.wms.wmsbackend.dto.RestockSuggestionDto;
import com.wms.wmsbackend.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RestockPredictionService {

    @Autowired
    private ProductService productService;

    /**
     * Get all predictive restocking suggestions based on the Reorder Point (ROP) model.
     * ROP = (Daily Usage * Lead Time) + Safety Stock
     */
    public List<RestockSuggestionDto> getRestockSuggestions() {
        List<Product> products = productService.getAllProducts();
        List<RestockSuggestionDto> suggestions = new ArrayList<>();

        for (Product product : products) {
            Double dailyUsage = product.getDailyUsage() != null ? product.getDailyUsage() : 0.0;
            Integer leadTime = product.getLeadTimeDays() != null ? product.getLeadTimeDays() : 0;
            Integer safetyStock = product.getSafetyStock() != null ? product.getSafetyStock() : 0;
            Integer currentStock = product.getStock() != null ? product.getStock() : 0;

            // Only generate predictions if we have some usage data
            if (dailyUsage > 0.0) {
                int reorderPoint = (int) Math.ceil((dailyUsage * leadTime) + safetyStock);

                if (currentStock <= reorderPoint) {
                    RestockSuggestionDto dto = new RestockSuggestionDto();
                    dto.setSkuCode(product.getSkuCode());
                    dto.setName(product.getName());
                    dto.setCurrentStock(currentStock);
                    dto.setDailyUsage(dailyUsage);
                    dto.setLeadTimeDays(leadTime);
                    dto.setSafetyStock(safetyStock);
                    dto.setReorderPoint(reorderPoint);

                    // Suggested order to replenish safety stock and cover lead time again
                    int suggestedOrder = reorderPoint - currentStock + safetyStock + (int) Math.ceil(dailyUsage * 30); // E.g., order 30 days of supply
                    dto.setSuggestedOrderQuantity(suggestedOrder);

                    int daysLeft = (int) Math.floor(currentStock / dailyUsage);
                    dto.setDaysUntilDepletion(daysLeft);

                    // Determine urgency
                    if (daysLeft <= product.getLeadTimeDays()) {
                        dto.setUrgency("High");
                        dto.setReason("Stock will deplete before lead time replenishment.");
                    } else if (currentStock <= safetyStock) {
                        dto.setUrgency("Medium");
                        dto.setReason("Stock is below safety levels.");
                    } else {
                        dto.setUrgency("Low");
                        dto.setReason("Approaching reorder point.");
                    }

                    suggestions.add(dto);
                }
            } else if (currentStock <= safetyStock) {
                // If no usage data, but stock is below safety, still alert
                RestockSuggestionDto dto = new RestockSuggestionDto();
                dto.setSkuCode(product.getSkuCode());
                dto.setName(product.getName());
                dto.setCurrentStock(currentStock);
                dto.setSafetyStock(safetyStock);
                dto.setUrgency("Medium");
                dto.setReason("Static stock below safety threshold.");
                dto.setSuggestedOrderQuantity(safetyStock * 2);
                suggestions.add(dto);
            }
        }

        return suggestions;
    }
}
