import sqlite3
import datetime
import os
import re

# --- 配置 ---
# 旧数据库的路径
OLD_DB_PATH = '/Users/cheo/Desktop/BA_ZI_V4/bazi-backend/data/bazi_data.db'
# 新数据库的路径
NEW_DB_PATH = '/Users/cheo/Desktop/BA_ZI_V4/bazi-backend/data/bazi_data_v2.db'

# --- 中文到数字的转换字典 ---
CHINESE_NUM_MAP = {
    '〇': '0', '一': '1', '二': '2', '三': '3', '四': '4',
    '五': '5', '六': '6', '七': '7', '八': '8', '九': '9',
}
CHINESE_MONTH_MAP = {
    '正': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6,
    '七': 7, '八': 8, '九': 9, '十': 10, '冬': 11, '腊': 12
}
CHINESE_DAY_MAP = {
    '初一': 1, '初二': 2, '初三': 3, '初四': 4, '初五': 5,
    '初六': 6, '初七': 7, '初八': 8, '初九': 9, '初十': 10,
    '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15,
    '十六': 16, '十七': 17, '十八': 18, '十九': 19, '二十': 20,
    '廿一': 21, '廿二': 22, '廿三': 23, '廿四': 24, '廿五': 25,
    '廿六': 26, '廿七': 27, '廿八': 28, '廿九': 29, '三十': 30
}

def parse_lunar_string(lunar_str):
    """
    解析中文农历日期字符串
    """
    try:
        # 1. 解析年份
        year_cn = lunar_str[:5] # "一九九零年"
        year_str = "".join([CHINESE_NUM_MAP[c] for c in year_cn if c in CHINESE_NUM_MAP])
        lunar_year = int(year_str)

        # 2. 解析日期
        day_cn = lunar_str[-2:] # "初一"
        lunar_day = CHINESE_DAY_MAP[day_cn]

        # 3. 解析月份 (核心逻辑)
        month_part_cn = lunar_str[5:-2] # "腊月" 或 "闰腊月"
        is_leap_month = 1 if month_part_cn.startswith('闰') else 0
        
        month_cn = month_part_cn.replace('闰', '').replace('月', '')
        lunar_month = CHINESE_MONTH_MAP[month_cn]

        return lunar_year, lunar_month, lunar_day, is_leap_month
    except Exception as e:
        print(f"解析农历字符串失败: '{lunar_str}', 错误: {e}")
        return None, None, None, None


def upgrade_database():
    """
    主函数：执行数据库升级
    """
    if not os.path.exists(OLD_DB_PATH):
        print(f"错误: 找不到旧数据库文件 at {OLD_DB_PATH}")
        return

    if os.path.exists(NEW_DB_PATH):
        print(f"警告: 新数据库文件 {NEW_DB_PATH} 已存在，将删除重建。")
        os.remove(NEW_DB_PATH)

    # 连接数据库
    old_conn = sqlite3.connect(OLD_DB_PATH)
    new_conn = sqlite3.connect(NEW_DB_PATH)
    old_cursor = old_conn.cursor()
    new_cursor = new_conn.cursor()

    # 在新数据库中创建新表
    new_cursor.execute('''
        CREATE TABLE Pillars (
            gregorian_datetime TEXT PRIMARY KEY,
            gregorian_year INTEGER,
            gregorian_month INTEGER,
            gregorian_day INTEGER,
            hour INTEGER,
            lunar_date_str TEXT,
            lunar_year INTEGER,
            lunar_month INTEGER,
            lunar_day INTEGER,
            is_leap_month INTEGER,
            year_pillar TEXT,
            month_pillar TEXT,
            day_pillar TEXT,
            hour_pillar TEXT,
            tai_yuan TEXT,
            ming_gong TEXT,
            shen_gong TEXT
        )
    ''')

    # 读取所有旧数据
    old_cursor.execute("SELECT * FROM Pillars")
    rows = old_cursor.fetchall()

    print(f"共找到 {len(rows)} 条记录，开始转换...")

    # 循环处理并插入新数据
    for row in rows:
        (gregorian_datetime, year_pillar, month_pillar, day_pillar, hour_pillar,
         lunar_date_str, tai_yuan, ming_gong, shen_gong) = row

        # 解析公历
        dt_obj = datetime.datetime.strptime(gregorian_datetime, '%Y-%m-%d %H:%M:%S')
        gregorian_year = dt_obj.year
        gregorian_month = dt_obj.month
        gregorian_day = dt_obj.day
        hour = dt_obj.hour

        # 解析农历
        lunar_year, lunar_month, lunar_day, is_leap_month = parse_lunar_string(lunar_date_str)
        
        if lunar_year is None: # 如果解析失败，跳过此行
            continue

        # 准备插入新数据库的数据
        new_row = (
            gregorian_datetime, gregorian_year, gregorian_month, gregorian_day, hour,
            lunar_date_str, lunar_year, lunar_month, lunar_day, is_leap_month,
            year_pillar, month_pillar, day_pillar, hour_pillar,
            tai_yuan, ming_gong, shen_gong
        )
        
        # 插入数据
        new_cursor.execute('''
            INSERT INTO Pillars VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', new_row)

    # 创建索引以优化查询
    print("数据转换完成，正在创建索引...")
    new_cursor.execute('CREATE INDEX idx_lunar ON Pillars (lunar_year, lunar_month, lunar_day, is_leap_month);')
    new_cursor.execute('CREATE INDEX idx_pillars ON Pillars (year_pillar, month_pillar, day_pillar, hour_pillar);')
    print("索引创建成功！")

    # 提交并关闭连接
    new_conn.commit()
    old_conn.close()
    new_conn.close()

    print(f"🎉 成功！新的数据库文件已创建于: {NEW_DB_PATH}")

if __name__ == '__main__':
    upgrade_database()