// gugo-beep/bazi-backend/bazi-backend-18275ce3be8ede12177b43420d0b622777a7d327/src/databaseService.js

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
        SELECT year_pillar, month_pillar, day_pillar, hour_pillar, lunar_date_str, tai_yuan, ming_gong, shen_gong
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

/**
 * [重构] 根据四柱信息，查找所有匹配的公历日期时间
 * @param {object} pillars - { year_pillar, month_pillar, day_pillar, hour_pillar }
 * @returns {Promise<string[]>} - 匹配的公历日期时间字符串数组
 */
export const findAllDatesByPillars = (pillars) => {
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
 * [V2 - 彻底重写] 根据数字化的农历年月日和闰月信息，精确查找对应的公历年月日
 * @param {object} lunarData - { year, month, day, isLeap }
 * @returns {Promise<{year: number, month: number, day: number}|null>} 返回包含公历年月日的对象，如果未找到则返回null
 */
export const findGregorianDateByLunar = (lunarData) => {
    const db = getBaziDb();
    const sql = `
        SELECT gregorian_year, gregorian_month, gregorian_day
        FROM Pillars
        WHERE
            lunar_year = ? AND
            lunar_month = ? AND
            lunar_day = ? AND
            is_leap_month = ?
        LIMIT 1`;
        
    const params = [lunarData.year, lunarData.month, lunarData.day, lunarData.isLeap ? 1 : 0];

    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                return reject(new Error(`根据农历查询公历日期时出错: ${err.message}`));
            }
            if (row) {
                resolve({
                    year: row.gregorian_year,
                    month: row.gregorian_month,
                    day: row.gregorian_day
                });
            } else {
                resolve(null); // 如果没有找到匹配的日期，返回 null
            }
        });
    });
};