-- Add Default Admin User ('00-X-ALPHA', password 'admin')
INSERT IGNORE INTO wms_user (username, password_hash, role) VALUES ('00-X-ALPHA', '$2a$10$w0hR3jM80b95V0p.J4T5V.1hP2B/y5Q0aW/Zg22S.Gv1sH83W9P.q', 'ROLE_ADMIN');

-- 原始 3 个产品
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('PRD-X92-BLA', 'Black T-Shirt', '690123456789', 45, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('SKU-441-MET', 'Metal Water Bottle', '690987654321', 12, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('LOG-772-GRN', 'Green Notebook', '690111222333', 150, NOW());

-- ====== 服装类 (Apparel) ======
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-001-WHT', 'White Cotton T-Shirt', '6901000000001', 120, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-002-RED', 'Red Polo Shirt', '6901000000002', 85, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-003-BLU', 'Blue Denim Jeans', '6901000000003', 64, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-004-GRY', 'Grey Hoodie', '6901000000004', 92, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-005-BLK', 'Black Leather Jacket', '6901000000005', 23, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-006-NAV', 'Navy Windbreaker', '6901000000006', 47, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-007-KHK', 'Khaki Cargo Pants', '6901000000007', 56, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-008-PNK', 'Pink Summer Dress', '6901000000008', 38, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-009-OLV', 'Olive Bomber Jacket', '6901000000009', 31, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-010-TAN', 'Tan Chino Shorts', '6901000000010', 77, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-011-CRM', 'Cream Linen Shirt', '6901000000011', 43, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('APR-012-CHR', 'Charcoal Suit Blazer', '6901000000012', 15, NOW());

-- ====== 電子製品 (Electronics) ======
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-001-SLV', 'Wireless Bluetooth Earbuds', '6902000000001', 200, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-002-BLK', 'USB-C Charging Cable 2m', '6902000000002', 350, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-003-WHT', 'Smart LED Desk Lamp', '6902000000003', 68, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-004-GLD', 'Portable Power Bank 20000mAh', '6902000000004', 142, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-005-BLU', 'Mechanical Gaming Keyboard', '6902000000005', 54, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-006-RED', 'Wireless Gaming Mouse', '6902000000006', 89, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-007-GRY', '27-inch 4K Monitor', '6902000000007', 22, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-008-BLK', 'Noise Cancelling Headphones', '6902000000008', 76, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-009-WHT', 'Smart Home Speaker', '6902000000009', 95, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-010-SLV', 'Laptop Stand Aluminum', '6902000000010', 130, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-011-BLK', 'Webcam HD 1080p', '6902000000011', 67, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('ELC-012-WHT', 'USB Hub 7-Port', '6902000000012', 183, NOW());

-- ====== 食品・飲料 (Food & Beverage) ======
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-001-GRN', 'Organic Green Tea 100g', '6903000000001', 240, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-002-BRN', 'Dark Roast Coffee Beans 500g', '6903000000002', 156, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-003-YLW', 'Pure Honey Jar 350ml', '6903000000003', 88, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-004-RED', 'Strawberry Jam 250g', '6903000000004', 112, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-005-WHT', 'Vanilla Protein Powder 1kg', '6903000000005', 73, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-006-ORG', 'Orange Juice 1L', '6903000000006', 195, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-007-BRN', 'Whole Wheat Pasta 500g', '6903000000007', 167, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-008-GLD', 'Extra Virgin Olive Oil 500ml', '6903000000008', 59, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-009-WHT', 'Oat Milk 1L', '6903000000009', 210, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-010-PRP', 'Blueberry Granola 400g', '6903000000010', 134, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-011-GRN', 'Matcha Latte Powder 200g', '6903000000011', 91, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('FNB-012-RED', 'Dried Cranberries 250g', '6903000000012', 78, NOW());

-- ====== 文具・事務用品 (Office Supplies) ======
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('OFC-001-BLU', 'Ballpoint Pen Set 10-Pack', '6904000000001', 320, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('OFC-002-BLK', 'A4 Copy Paper 500 Sheets', '6904000000002', 450, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('OFC-003-YLW', 'Sticky Notes 3x3 12-Pack', '6904000000003', 275, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('OFC-004-SLV', 'Stapler Heavy Duty', '6904000000004', 98, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('OFC-005-CLR', 'Binder Clips Assorted 48-Pack', '6904000000005', 188, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('OFC-006-BLK', 'Desk Organizer Wooden', '6904000000006', 44, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('OFC-007-WHT', 'Whiteboard Markers 8-Pack', '6904000000007', 163, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('OFC-008-RED', 'File Folders A4 20-Pack', '6904000000008', 201, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('OFC-009-GRN', 'Correction Tape 6-Pack', '6904000000009', 147, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('OFC-010-BRN', 'Kraft Paper Envelope 50-Pack', '6904000000010', 230, NOW());

-- ====== スポーツ用品 (Sports & Fitness) ======
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('SPT-001-BLK', 'Yoga Mat 6mm', '6905000000001', 82, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('SPT-002-RED', 'Resistance Bands Set', '6905000000002', 115, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('SPT-003-BLU', 'Jump Rope Speed Cable', '6905000000003', 143, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('SPT-004-GRY', 'Foam Roller 45cm', '6905000000004', 67, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('SPT-005-ORG', 'Basketball Official Size', '6905000000005', 39, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('SPT-006-WHT', 'Tennis Balls 3-Pack', '6905000000006', 256, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('SPT-007-BLK', 'Gym Gloves Leather', '6905000000007', 94, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('SPT-008-GRN', 'Water Bottle Sports 750ml', '6905000000008', 178, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('SPT-009-PNK', 'Dumbbell Set 5kg Pair', '6905000000009', 52, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('SPT-010-BLU', 'Swimming Goggles UV', '6905000000010', 108, NOW());

-- ====== 家庭用品 (Home & Living) ======
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('HOM-001-WHT', 'Cotton Bath Towel Set', '6906000000001', 86, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('HOM-002-GRY', 'Memory Foam Pillow', '6906000000002', 63, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('HOM-003-BLU', 'Ceramic Coffee Mug 350ml', '6906000000003', 215, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('HOM-004-GRN', 'Indoor Plant Pot Set', '6906000000004', 74, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('HOM-005-BRN', 'Bamboo Cutting Board', '6906000000005', 127, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('HOM-006-WHT', 'LED Candle Set 3-Pack', '6906000000006', 159, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('HOM-007-BLK', 'Wall Clock Modern 30cm', '6906000000007', 41, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('HOM-008-CRM', 'Throw Blanket Fleece', '6906000000008', 93, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('HOM-009-NAV', 'Storage Box Foldable', '6906000000009', 184, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('HOM-010-RED', 'Kitchen Timer Digital', '6906000000010', 136, NOW());

-- ====== 美容・健康 (Beauty & Health) ======
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('BTY-001-PNK', 'Rose Face Moisturizer 50ml', '6907000000001', 97, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('BTY-002-WHT', 'SPF50 Sunscreen 100ml', '6907000000002', 152, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('BTY-003-GLD', 'Vitamin C Serum 30ml', '6907000000003', 63, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('BTY-004-GRN', 'Aloe Vera Gel 200ml', '6907000000004', 189, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('BTY-005-LAV', 'Lavender Essential Oil 15ml', '6907000000005', 71, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('BTY-006-BLK', 'Charcoal Face Mask 5-Pack', '6907000000006', 128, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('BTY-007-WHT', 'Bamboo Toothbrush Set 4-Pack', '6907000000007', 234, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('BTY-008-PNK', 'Lip Balm Cherry SPF15', '6907000000008', 312, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('BTY-009-BRN', 'Argan Hair Oil 100ml', '6907000000009', 84, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('BTY-010-WHT', 'Hand Cream Shea Butter 75ml', '6907000000010', 176, NOW());

-- ====== ペット用品 (Pet Supplies) ======
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('PET-001-BRN', 'Premium Dog Food 5kg', '6908000000001', 65, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('PET-002-YLW', 'Cat Treats Chicken 200g', '6908000000002', 143, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('PET-003-RED', 'Dog Leash Nylon 1.5m', '6908000000003', 87, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('PET-004-BLU', 'Cat Toy Mouse Set 5-Pack', '6908000000004', 198, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('PET-005-GRN', 'Fish Tank Filter Cartridge', '6908000000005', 112, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('PET-006-GRY', 'Pet Bed Round Medium', '6908000000006', 33, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('PET-007-WHT', 'Bird Seed Mix 1kg', '6908000000007', 79, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('PET-008-BLK', 'Dog Shampoo Gentle 500ml', '6908000000008', 106, NOW());

-- ====== 自動車用品 (Automotive) ======
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('AUT-001-BLK', 'Car Phone Mount Magnetic', '6909000000001', 145, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('AUT-002-YLW', 'Microfiber Cleaning Cloth 10-Pack', '6909000000002', 267, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('AUT-003-RED', 'Emergency Road Kit', '6909000000003', 28, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('AUT-004-SLV', 'Car Air Freshener 3-Pack', '6909000000004', 189, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('AUT-005-BLK', 'Dashcam HD 1080p', '6909000000005', 42, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('AUT-006-BLU', 'Tire Pressure Gauge Digital', '6909000000006', 76, NOW());

-- ====== おもちゃ・ホビー (Toys & Hobby) ======
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('TOY-001-RED', 'Building Blocks Set 500pcs', '6910000000001', 54, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('TOY-002-BLU', 'RC Racing Car 1:18', '6910000000002', 37, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('TOY-003-YLW', 'Puzzle 1000 Pieces Landscape', '6910000000003', 82, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('TOY-004-GRN', 'Board Game Strategy Classic', '6910000000004', 46, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('TOY-005-PRP', 'Modeling Clay 12 Colors', '6910000000005', 163, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('TOY-006-ORG', 'Drone Mini Camera 720p', '6910000000006', 19, NOW());
INSERT IGNORE INTO product (sku_code, name, barcode, stock, create_time) VALUES ('TOY-007-WHT', 'Card Game Party Pack', '6910000000007', 124, NOW());
