import random

categories = [
    ("飲料", "DRK", ["お茶", "コーヒー", "コーラ", "ミネラルウォーター", "炭酸水", "野菜ジュース", "エナジードリンク"]),
    ("お菓子", "SNK", ["ポテトチップス", "チョコレート", "クッキー", "せんべい", "グミ", "キャンディ", "ナッツ"]),
    ("カップ麺", "NOD", ["醤油ラーメン", "味噌ラーメン", "豚骨ラーメン", "焼きそば", "うどん", "そば", "タンメン"]),
    ("文房具", "STN", ["ボールペン", "シャープペンシル", "ノート", "消しゴム", "付箋", "クリアファイル", "ハサミ"]),
    ("雑貨", "GEN", ["タオル", "マグカップ", "洗剤", "石鹸", "歯ブラシ", "マスク", "電池"])
]

brands = ["サントリー", "キリン", "アサヒ", "カルビー", "明治", "森永", "日清", "三菱鉛筆", "コクヨ", "花王"]

sql_lines = ["\n-- ====== JAN Search Simulation (500 Products) ======\n"]

for i in range(1, 501):
    cat_name, prefix, items = random.choice(categories)
    item_name = random.choice(items)
    brand = random.choice(brands)
    
    sku = f"JAN-{prefix}-{i:04d}"
    product_full_name = f"{brand} {item_name} {random.randint(100, 500)}g/ml"
    # JAN-13 starts with 49 or 45 for Japan
    barcode = f"{random.choice([49, 45])}{random.randint(10000000000, 99999999999)}"
    stock = random.randint(5, 500)
    
    # Randomly set usage and lead time for predictive features
    daily_usage = round(random.uniform(0.5, 5.0), 2)
    lead_time = random.randint(3, 14)
    safety_stock = random.randint(10, 50)
    
    sql = f"INSERT IGNORE INTO product (sku_code, name, barcode, stock, daily_usage, lead_time_days, safety_stock, create_time) VALUES ('{sku}', '{product_full_name}', '{barcode}', {stock}, {daily_usage}, {lead_time}, {safety_stock}, NOW());"
    sql_lines.append(sql)

with open("/Volumes/Lexar/SotsuGyouSaku/src/main/resources/data_jan.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print("Generated 500 product records in data_jan.sql")
