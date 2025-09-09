// gugo-beep/backend/backend-4be0ba13368314c6714a4251deaaa86cb07287d8/src/databaseService.js

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// --- 数据库文件路径设置 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BAZI_DB_PATH = path.resolve(__dirname, '../data/bazi_data.db');
const SOLAR_TERMS_DB_PATH = path.resolve(__dirname, '../data/SolarTerms.db');

// --- 数据库连接池 ---
let baziDb = null;
let solarTermsDb = null;

const getBaziDb = () => {
    if (!baziDb) {
        baziDb = new sqlite3.Database(BAZI_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
            if (err) console.error('无法连接到 bazi_data.db 数据库:', err.message);
            else console.log('成功连接到 bazi_data.db 数据库。');
        });
    }
    return baziDb;
};

const getSolarTermsDb = () => {
    if (!solarTermsDb) {
        solarTermsDb = new sqlite3.Database(SOLAR_TERMS_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
            if (err) console.error('无法连接到 SolarTerms.db 数据库:', err.message);
            else console.log('成功连接到 SolarTerms.db 数据库。');
        });
    }
    return solarTermsDb;
};

// ... 其他未修改的函数保持原样 ...
export const getBaziPillars = (dateTimeString) => {
    const db = getBaziDb();
    const sql = `
        SELECT year_pillar, month_pillar, day_pillar, hour_pillar,Lunar_date_str,tai_yuan,ming_gong,shen_gong
        FROM Pillars 
        WHERE gregorian_datetime <= ? 
        ORDER BY gregorian_datetime DESC 
        LIMIT 1`;
    return new Promise((resolve, reject) => {
        db.get(sql, [dateTimeString], (err, row) => {
            if (err) reject(new Error(`查询四柱时出错: ${err.message}`));
            else resolve(row);
        });
    });
};
export const getAdjacentSolarTerm = (dateTimeString, direction) => {
    const db = getSolarTermsDb();
    const isAfter = direction === 'after';
    const JIE_LIST = `('立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒')`;
    const sql = `
        SELECT exact_datetime 
        FROM SolarTerms 
        WHERE term_name IN ${JIE_LIST} AND exact_datetime ${isAfter ? '>=' : '<='} ?
        ORDER BY exact_datetime ${isAfter ? 'ASC' : 'DESC'}
        LIMIT 1`;
    return new Promise((resolve, reject) => {
        db.get(sql, [dateTimeString], (err, row) => {
            if (err) reject(new Error(`查询节气时出错: ${err.message}`));
            else resolve(row ? row.exact_datetime : null);
        });
    });
};
export const getLiChunForYear = (year) => {
    const db = getSolarTermsDb();
    const sql = `
        SELECT exact_datetime 
        FROM SolarTerms 
        WHERE term_name = '立春' AND substr(exact_datetime, 1, 4) = ?
        LIMIT 1`;
    return new Promise((resolve, reject) => {
        db.get(sql, [String(year)], (err, row) => {
            if (err) reject(new Error(`查询立春时间时出错: ${err.message}`));
            else resolve(row ? row.exact_datetime : null);
        });
    });
};
export const getJieQiInRange = (startYear, endYear) => {
    const db = getSolarTermsDb();
    const JIE_LIST = `('立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒')`;
    const sql = `
        SELECT term_name, exact_datetime 
        FROM SolarTerms 
        WHERE term_name IN ${JIE_LIST} AND CAST(substr(exact_datetime, 1, 4) AS INTEGER) BETWEEN ? AND ?
        ORDER BY exact_datetime ASC`;
    return new Promise((resolve, reject) => {
        db.all(sql, [startYear, endYear], (err, rows) => {
            if (err) reject(new Error(`查询范围节气时出错: ${err.message}`));
            else resolve(rows);
        });
    });
};
export const findDatesByPillars = (pillars) => {
    const db = getBaziDb();
    const sql = `
        SELECT gregorian_datetime 
        FROM Pillars 
        WHERE year_pillar = ? AND month_pillar = ? AND day_pillar = ? AND hour_pillar = ?`;
    const params = [pillars.year_pillar, pillars.month_pillar, pillars.day_pillar, pillars.hour_pillar];
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(new Error(`根据四柱查询日期时出错: ${err.message}`));
            else resolve(rows.map(r => r.gregorian_datetime));
        });
    });
};


/**
 * 任务 2.1 (重写): 根据农历精确查询公历生日
 * @param {object} lunarData - { year, month, day, hour, minute, isLeap }
 * @returns {Promise<string[]>} 包含唯一公历日期字符串的数组，或空数组
 */
export const findDatesByLunar = (lunarData) => {
    const db = getBaziDb();

    // 1. 精确的数字到汉字转换
    const toChineseYear = (year) => String(year).split('').map(char => '〇一二三四五六七八九'[char]).join('');
    const toChineseMonth = (month, isLeap) => (isLeap ? '闰' : '') + ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'][month - 1] + '月';
    const toChineseDay = (day) => {
        if (day <= 10) return '初' + '一二三四五六七八九十'[day-1];
        if (day < 20) return '十' + '一二三四五六七八九'[day-11];
        if (day === 20) return '二十';
        if (day < 30) return '廿' + '一二三四五六七八九'[day-21];
        if (day === 30) return '三十';
        return '';
    };

    // 2. 构造精确的查询字符串 (年月日)
    const yearStr = toChineseYear(lunarData.year);
    const monthStr = toChineseMonth(lunarData.month, lunarData.isLeap);
    const dayStr = toChineseDay(lunarData.day);
    const searchTerm = `${yearStr}年${monthStr}${dayStr}`;
    
    // 3. 查询当天所有时辰的记录
    const sql = `SELECT gregorian_datetime FROM Pillars WHERE lunar_date_str LIKE ?`;

    return new Promise((resolve, reject) => {
        db.all(sql, [`${searchTerm}%`], (err, rows) => {
            if (err) {
                return reject(new Error(`根据农历查询日期时出错: ${err.message}`));
            }
            if (rows.length === 0) {
                return resolve([]);
            }
            
            // 4. 在内存中根据小时和分钟进行精确筛选
            const targetHour = lunarData.hour;
            const targetMinute = lunarData.minute;

            // 寻找最接近用户输入时间的记录
            // 八字一个时辰为2小时，我们应以用户输入时间所在的那个时辰的起始时间为准
            for (const row of rows) {
                const rowDate = new Date(row.gregorian_datetime);
                const rowHour = rowDate.getHours();
                
                // 八字时辰的判断逻辑：子时跨日，需要特殊处理
                if (targetHour === 23 && rowHour === 23) {
                     return resolve([row.gregorian_datetime]);
                }
                if (targetHour < 23 && (rowHour >= targetHour && rowHour < targetHour + 2) ) {
                    // 对于非子时，我们只要找到对应小时区间的记录即可
                    // 为简化，我们直接取整点/奇数小时的记录
                    if(rowHour % 2 === 1 || rowHour === 0){
                        return resolve([row.gregorian_datetime]);
                    }
                }
            }

            // 如果没有找到精确匹配的时辰，则返回空
            resolve([]);
        });
    });
};