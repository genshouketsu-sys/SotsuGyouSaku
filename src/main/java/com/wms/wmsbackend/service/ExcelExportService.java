package com.wms.wmsbackend.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wms.wmsbackend.entity.Product;
import com.wms.wmsbackend.mapper.ProductMapper;
import com.wms.wmsbackend.util.ExcelExportUtil;

/**
 * Excel导出服务 - 处理UTF-8编码防止乱码 Excel Export Service - Handle UTF-8 encoding to
 * prevent garbled characters
 */
@Service
public class ExcelExportService {

    @Autowired
    private ProductMapper productMapper;

    /**
     * 导出所有产品为Excel文件（UTF-8编码） Export all products to Excel file with UTF-8
     * encoding
     */
    public byte[] exportProductsToExcel() throws IOException {
        List<Product> products = productMapper.findAll();

        List<String> headers = Arrays.asList(
                "ID",
                "SKU Code",
                "Product Name",
                "Barcode",
                "Stock",
                "Daily Usage",
                "Lead Time",
                "Safety Stock",
                "Created Time"
        );

        List<Map<String, Object>> data = new ArrayList<>();
        for (Product product : products) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put(headers.get(0), product.getId());
            row.put(headers.get(1), product.getSkuCode());
            row.put(headers.get(2), product.getName());
            row.put(headers.get(3), product.getBarcode());
            row.put(headers.get(4), product.getStock());
            row.put(headers.get(5), product.getDailyUsage());
            row.put(headers.get(6), product.getLeadTimeDays());
            row.put(headers.get(7), product.getSafetyStock());
            row.put(headers.get(8), product.getCreateTime());
            data.add(row);
        }

        return ExcelExportUtil.exportToExcel(headers, data);
    }

    /**
     * 按低库存导出产品为Excel文件（UTF-8编码） Export low stock products to Excel file with
     * UTF-8 encoding
     */
    public byte[] exportLowStockProductsToExcel() throws IOException {
        List<Product> products = productMapper.findAll();
        List<Product> lowStockProducts = new ArrayList<>();

        // 过滤低库存产品
        for (Product product : products) {
            if (product.getStock() < product.getSafetyStock()) {
                lowStockProducts.add(product);
            }
        }

        List<String> headers = Arrays.asList(
                "ID",
                "SKU Code",
                "Product Name",
                "Barcode",
                "Current Stock",
                "Safety Stock",
                "Shortage Amount",
                "Daily Usage"
        );

        List<Map<String, Object>> data = new ArrayList<>();
        for (Product product : lowStockProducts) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put(headers.get(0), product.getId());
            row.put(headers.get(1), product.getSkuCode());
            row.put(headers.get(2), product.getName());
            row.put(headers.get(3), product.getBarcode());
            row.put(headers.get(4), product.getStock());
            row.put(headers.get(5), product.getSafetyStock());
            row.put(headers.get(6), product.getSafetyStock() - product.getStock());
            row.put(headers.get(7), product.getDailyUsage());
            data.add(row);
        }

        return ExcelExportUtil.exportToExcel(headers, data);
    }
}
