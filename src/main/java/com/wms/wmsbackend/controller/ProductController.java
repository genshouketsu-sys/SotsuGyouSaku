package com.wms.wmsbackend.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wms.wmsbackend.annotation.Idempotent;
import com.wms.wmsbackend.entity.Product;
import com.wms.wmsbackend.service.ExcelExportService;
import com.wms.wmsbackend.service.ProductService;

import java.nio.charset.StandardCharsets;

/**
 * 商品管理コントローラー / 商品管理控制器
 *
 * GET    /api/products               — 获取全部商品
 * POST   /api/products               — 添加商品（需 name + skuCode）
 * PUT    /api/products/{id}          — 更新商品
 * DELETE /api/products/{id}          — 删除商品
 * POST   /api/products/batch-inbound — 批量入库（幂等）
 * GET    /api/products/export/all    — 导出 Excel（全量）
 * GET    /api/products/export/low-stock — 导出 Excel（低库存）
 *
 * CORS は SecurityConfig でグローバル設定済み。/ CORS 已在 SecurityConfig 全局配置。
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    @Autowired
    private ExcelExportService excelExportService;

    /** 全商品取得 / 获取全部商品 */
    @GetMapping
    public ResponseEntity<List<Product>> getAll() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    /** 商品追加 / 添加商品 */
    @PostMapping
    public ResponseEntity<Map<String, Object>> add(@RequestBody Product product) {
        // ── 基本パラメータ検証 / 基础参数校验 ────────────────────────────
        if (product.getName() == null || product.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "商品名は必須です / 商品名称不能为空"
            ));
        }
        if (product.getSkuCode() == null || product.getSkuCode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "SKUコードは必須です / SKU编码不能为空"
            ));
        }
        // ─────────────────────────────────────────────────────────────────

        Map<String, Object> response = new HashMap<>();
        if (productService.addProduct(product)) {
            response.put("success", true);
            response.put("message", "商品追加成功 / 商品添加成功");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
        response.put("success", false);
        response.put("message", "商品追加失敗 / 商品添加失败（データベースエラー / 数据库错误）");
        return ResponseEntity.internalServerError().body(response);
    }

    /** 一括入庫（冪等性制御付き） / 批量入库（含幂等性控制） */
    @PostMapping("/batch-inbound")
    @Idempotent(strategy = Idempotent.IdempotentStrategy.PARAM_HASH, timeout = 3000)
    public ResponseEntity<Map<String, Object>> batchInbound(@RequestBody List<String> barcodes) {
        if (barcodes == null || barcodes.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "バーコードリストは空にできません / 条码列表不能为空"
            ));
        }
        productService.batchInbound(barcodes);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "一括入庫成功 / 批量入库成功，共 " + barcodes.size() + " 件");
        response.put("count", barcodes.size());
        return ResponseEntity.ok(response);
    }

    /** 商品更新 / 更新商品 */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        Map<String, Object> response = new HashMap<>();
        if (productService.updateProduct(product)) {
            response.put("success", true);
            response.put("message", "商品更新成功 / 商品更新成功");
            return ResponseEntity.ok(response);
        }
        response.put("success", false);
        response.put("message", "商品が見つかりません / 商品不存在或更新失败");
        // 行が更新されなかった場合 404 を返す / 未更新到任何行时返回 404
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /** 商品削除 / 删除商品 */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        if (productService.deleteProduct(id)) {
            response.put("success", true);
            response.put("message", "商品削除成功 / 商品删除成功");
            return ResponseEntity.ok(response);
        }
        response.put("success", false);
        response.put("message", "商品が見つかりません / 商品不存在");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /** 全商品 Excel エクスポート / 导出全部商品 Excel */
    @GetMapping("/export/all")
    public ResponseEntity<byte[]> exportAllProducts() {
        try {
            byte[] excelData = excelExportService.exportProductsToExcel();
            HttpHeaders headers = buildExcelHeaders("商品一覧.xlsx");
            return ResponseEntity.ok().headers(headers).body(excelData);
        } catch (IOException e) {
            log.error("全商品エクスポートに失敗しました / 导出全部商品失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /** 低在庫商品 Excel エクスポート / 导出低库存商品 Excel */
    @GetMapping("/export/low-stock")
    public ResponseEntity<byte[]> exportLowStockProducts() {
        try {
            byte[] excelData = excelExportService.exportLowStockProductsToExcel();
            HttpHeaders headers = buildExcelHeaders("低在庫商品.xlsx");
            return ResponseEntity.ok().headers(headers).body(excelData);
        } catch (IOException e) {
            log.error("低在庫商品エクスポートに失敗しました / 导出低库存商品失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /** Excel ダウンロード用 HTTP ヘッダーを生成 / 生成 Excel 下载响应头 */
    private HttpHeaders buildExcelHeaders(String fileName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(
            ContentDisposition.attachment()
                .filename(fileName, StandardCharsets.UTF_8)
                .build());
        headers.add("Content-Transfer-Encoding", "binary");
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        return headers;
    }
}
