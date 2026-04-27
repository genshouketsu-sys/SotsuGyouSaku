package com.wms.wmsbackend.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data // Lombok 注解，自动生成 getter/setter/toString
public class Product {
    private Long id;
    private String skuCode;     // SKU 编码 (SKUコード)
    private String name;        // 商品名称 (商品名)
    private String barcode;     // 条形码 (バーコード)
    private Integer stock;      // 当前库存 (現在の在庫)
    private LocalDateTime createTime; // 创建时间 (作成日時)
}