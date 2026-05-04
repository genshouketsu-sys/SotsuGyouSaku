import random

def generate_coffee_ultra_comprehensive():
    # Massive expansion of Bottled Coffee variations
    coffee_data = [
        ("サントリー", "クラフトボス", ["ブラック", "ラテ", "微糖", "ほうじ茶ラテ", "抹茶ラテ", "キャラメルラテ", "ビターラテ", "甘くないイタリアン", "ハニーラテ", "ヘーゼルナッツ", "ダブルショコララテ", "ストレートティー", "ミルクティー"]),
        ("コカ・コーラ", "ジョージア ジャパン クラフトマン", ["ブラック", "カフェラテ", "微糖", "キャラメルラテ", "ホワイトモカ", "紅茶花伝コラボ", "ダークモカ"]),
        ("コカ・コーラ", "ジョージア THE", ["ブラック", "ラテ", "微糖", "プレミアムブラック", "プレミアムラテ"]),
        ("コカ・コーラ", "コスタ コーヒー", ["フラットホワイト", "ラテ", "ブラック", "ハニーラテ", "アーモンドラテ", "抹茶エスプレッソ", "プレミアムラテ", "カプチーノ", "キャラメルマキアート"]),
        ("アサヒ", "ワンダ 極", ["ブラック", "微糖", "カフェオレ", "特濃オレ", "超深煎り"]),
        ("アサヒ", "ワンダ モーニングショット", ["ブラック", "微糖", "砂糖ゼロ", "クリーミー"]),
        ("キリン", "ファイア ワンデイ", ["ブラック", "ラテ", "微糖", "砂糖不使用ラテ", "パワードコーヒー"]),
        ("サントリー", "ボス", ["とろけるカフェオレ", "カフェオレ", "レインボーマウンテン", "贅沢微糖", "シルキーブラック", "無糖ブラック"]),
        ("伊藤園", "タリーズコーヒー BARISTA'S", ["BLACK", "LATTE", "微糖", "カプチーノ", "ほうじ茶ラテ", "ロイヤルミルクティー"]),
        ("UCC", "COLD BREW", ["BLACK", "LATTE", "微糖", "ハニーティー", "レモネードコーヒー"]),
        ("UCC", "BEANS & ROASTERS", ["カフェラテ", "マイルドラテ", "アーモンドラテ"]),
        ("ダイドー", "ダイドーブレンド", ["クラフト ブラック", "クラフト ラテ", "世界一のバリスタ", "絶品微糖", "デミタスコーヒー"]),
        ("ドトール", "ドトールコーヒーショップ", ["ブラック", "カフェオレ", "ハニーカフェオレ"]),
        ("スターバックス", "カフェプレミアム", ["ブラック", "カフェラテ", "ホワイトモカ"]),
        ("味の素AGF", "ブレンディ", ["ボトルコーヒー 無糖", "ボトルコーヒー 低糖", "挽きたてプレミアム", "カフェラトリー"]),
        ("森永乳業", "マウントレーニア", ["カフェラッテ", "エスプレッソ", "ノンシュガー", "クリーミーラテ", "モカ", "キャラメルマキアート", "期間限定ショコラ"]),
        ("セブンプレミアム", "セブンカフェ", ["ブラック 無糖", "カフェラテ 甘くない", "カフェラテ 砂糖使用"]),
        ("ファミリーマート", "ファミマル", ["微糖コーヒー", "ブラックコーヒー", "カフェラテ"]),
        ("ローソン", "MACHI cafe", ["ブラック", "カフェラテ", "キャラメルマキアート"]),
        ("ポッカサッポロ", "アロマックス", ["プレミアムブラック", "東海プレミアム", "ファンタジスタ"]),
    ]

    all_sql = ["\n-- ====== Ultra Comprehensive Bottled Coffee Expansion ======\n"]
    
    for brand, series, variations in coffee_data:
        for var in variations:
            sizes = [280, 370, 440, 500, 600, 950]
            selected_sizes = random.sample(sizes, random.randint(1, 2))
            
            for size in selected_sizes:
                sku = f"COF-{random.randint(1000,9999)}-{random.randint(10,99)}"
                product_name = f"{brand} {series} {var} {size}ml"
                # Escape single quotes for SQL
                product_name_escaped = product_name.replace("'", "''")
                
                barcode = f"{random.choice([49, 45])}{random.randint(10000000000, 99999999999)}"
                stock = random.randint(0, 300)
                daily_usage = round(random.uniform(0.5, 20.0), 2)
                lead_time = random.randint(1, 7)
                safety_stock = random.randint(6, 60)
                
                sql = f"INSERT IGNORE INTO product (sku_code, name, barcode, stock, daily_usage, lead_time_days, safety_stock, create_time) VALUES ('{sku}', '{product_name_escaped}', '{barcode}', {stock}, {daily_usage}, {lead_time}, {safety_stock}, NOW());"
                all_sql.append(sql)

    output_path = "/Volumes/Lexar/SotsuGyouSaku/src/main/resources/data_coffee_all.sql"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(all_sql))
    
    print(f"Generated {len(all_sql)-1} ultra-comprehensive coffee records")

if __name__ == "__main__":
    generate_coffee_ultra_comprehensive()
