import random

def generate_drinks():
    soft_drinks = {
        "prefix": "SFT",
        "brands": ["サントリー", "キリン", "アサヒ", "コカ・コーラ", "伊藤園", "サッポロ", "ダイドー", "サンガリア"],
        "items": ["天然水", "伊右衛門", "お～いお茶", "生茶", "午後の紅茶", "クラフトボス", "三ツ矢サイダー", "モンスターエナジー", "アクエリアス", "ポカリスエット", "爽健美茶", "綾鷹", "カルピスウォーター", "十六茶", "特茶", "ウィルキンソン 炭酸", "ペプシ 生", "南アルプスの天然水", "ヘルシア緑茶", "黒烏龍茶"],
        "count": 180
    }

    chilled_drinks = {
        "prefix": "CHL",
        "brands": ["森永乳業", "雪印メグミルク", "明治", "グリコ", "スターバックス", "カゴメ", "ヤクルト", "エルビー"],
        "items": ["特濃ミルク", "カフェオレ", "おいしい牛乳", "野菜生活100", "100%オレンジジュース", "100%アップルジュース", "飲むヨーグルト", "マウントレーニア カフェラッテ", "豆乳 調整", "豆乳 無調整", "小岩井 ミルクとコーヒー", "リプトン ピーチティー", "明治 ブルガリア 飲むヨーグルト", "野菜一日これ一本", "朝のフルーツこれ一本"],
        "count": 120
    }

    alcohol_drinks = {
        "prefix": "ALC",
        "brands": ["サントリー", "アサヒ", "キリン", "サッポロ", "チョーヤ", "宝酒造", "オリオン"],
        "items": ["スーパードライ", "一番搾り", "プレミアムモルツ", "黒ラベル", "ほろよい もも", "ほろよい 白サワー", "氷結 レモン", "氷結 グレープフルーツ", "ストロングゼロ ドライ", "こだわり酒場のレモンサワー", "濃いめのレモンサワー", "金麦", "本麒麟", "クリアアサヒ", "のどごし生", "淡麗グリーンラベル", "翠 ジンソーダ缶", "角ハイボール缶", "檸檬堂 定番レモン"],
        "count": 130
    }

    all_sql = ["\n-- ====== Convenience Store Drinks (Drinks Expansion) ======\n"]
    
    id_counter = 5000 # Start from 5000 to avoid conflicts with previous generations
    
    for category in [soft_drinks, chilled_drinks, alcohol_drinks]:
        prefix = category["prefix"]
        brands = category["brands"]
        items = category["items"]
        count = category["count"]
        
        for i in range(1, count + 1):
            brand = random.choice(brands)
            item = random.choice(items)
            sku = f"DRK-{prefix}-{i:04d}"
            
            # Realistic volumes
            if prefix == "SFT":
                volume = random.choice([500, 600, 2000])
            elif prefix == "CHL":
                volume = random.choice([200, 330, 450, 1000])
            else:
                volume = random.choice([350, 500])
                
            product_name = f"{brand} {item} {volume}ml"
            # JAN-13: 45 or 49
            barcode = f"{random.choice([49, 45])}{random.randint(10000000000, 99999999999)}"
            stock = random.randint(0, 150)
            
            daily_usage = round(random.uniform(1.0, 10.0), 2)
            lead_time = random.randint(1, 5) # Convenience store items have fast turnaround
            safety_stock = random.randint(12, 36)
            
            sql = f"INSERT IGNORE INTO product (sku_code, name, barcode, stock, daily_usage, lead_time_days, safety_stock, create_time) VALUES ('{sku}', '{product_name}', '{barcode}', {stock}, {daily_usage}, {lead_time}, {safety_stock}, NOW());"
            all_sql.append(sql)
            id_counter += 1

    output_path = "/Volumes/Lexar/SotsuGyouSaku/src/main/resources/data_drinks.sql"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(all_sql))
    
    print(f"Generated {len(all_sql)-1} drink records in {output_path}")

if __name__ == "__main__":
    generate_drinks()
