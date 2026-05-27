package com.wms.wmsbackend.dto;

public class RestockSuggestionDto {
    private String skuCode;
    private String name;
    private Integer currentStock;
    private Double dailyUsage;
    private Integer leadTimeDays;
    private Integer safetyStock;
    private Integer reorderPoint;
    private Integer suggestedOrderQuantity;
    private Integer daysUntilDepletion;
    private String urgency; // "High", "Medium", "Low"
    private String reason;
    private String predictedDepletionDate;

    // --- AI 拡張フィールド / AI Extension Fields ---
    private Double confidenceScore;        // 予測信頼度 (0.0〜1.0)
    private String predictionSource;       // "ai_exponential_smoothing" or "rule_based"
    private Double predictedDailyUsage;    // AI予測の日次使用量

    // Getters and Setters
    public String getPredictedDepletionDate() { return predictedDepletionDate; }
    public void setPredictedDepletionDate(String predictedDepletionDate) { this.predictedDepletionDate = predictedDepletionDate; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getSkuCode() { return skuCode; }
    public void setSkuCode(String skuCode) { this.skuCode = skuCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public Double getDailyUsage() { return dailyUsage; }
    public void setDailyUsage(Double dailyUsage) { this.dailyUsage = dailyUsage; }

    public Integer getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }

    public Integer getSafetyStock() { return safetyStock; }
    public void setSafetyStock(Integer safetyStock) { this.safetyStock = safetyStock; }

    public Integer getReorderPoint() { return reorderPoint; }
    public void setReorderPoint(Integer reorderPoint) { this.reorderPoint = reorderPoint; }

    public Integer getSuggestedOrderQuantity() { return suggestedOrderQuantity; }
    public void setSuggestedOrderQuantity(Integer suggestedOrderQuantity) { this.suggestedOrderQuantity = suggestedOrderQuantity; }

    public Integer getDaysUntilDepletion() { return daysUntilDepletion; }
    public void setDaysUntilDepletion(Integer daysUntilDepletion) { this.daysUntilDepletion = daysUntilDepletion; }

    // --- AI 拡張フィールドの Getter/Setter ---
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getPredictionSource() { return predictionSource; }
    public void setPredictionSource(String predictionSource) { this.predictionSource = predictionSource; }

    public Double getPredictedDailyUsage() { return predictedDailyUsage; }
    public void setPredictedDailyUsage(Double predictedDailyUsage) { this.predictedDailyUsage = predictedDailyUsage; }
}
