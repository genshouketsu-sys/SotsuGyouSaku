CREATE TABLE IF NOT EXISTS `product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sku_code` varchar(50) NOT NULL UNIQUE,
  `name` varchar(100) NOT NULL,
  `barcode` varchar(100),
  `stock` int NOT NULL DEFAULT 0,
  `daily_usage` decimal(10,2) DEFAULT 0.0,
  `lead_time_days` int DEFAULT 7,
  `safety_stock` int DEFAULT 10,
  `create_time` timestamp DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wms_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'ROLE_ADMIN',
  `display_name` varchar(100),
  `email` varchar(100),
  `avatar_url` varchar(255),
  `create_time` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wms_scan_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `barcode` varchar(100) NOT NULL,
  `user_id` varchar(50),
  `scan_time` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;