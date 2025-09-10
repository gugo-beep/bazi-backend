// gugo-beep/bazi-backend/bazi-backend-18275ce3be8ede12177b43420d0b622777a7d327/src/inputProcessor.js

import * as databaseService from './databaseService.js';
// 导入统一的常量
import {
    GAN_ZHI_CYCLE_SET,
    CHINESE_CHAR_TO_NUMBER,
    CHINESE_MONTH_TO_NUMBER,
    CHINESE_DAY_MAP
} from './constants.js';

// --- 核心功能函数 ---

/**
 * [V3 - 修正版] 核心函数：解析中文农历日期字符串
 * @param {string} dateStr - 例如 "二〇〇二年八月十四"
 * @returns {{year: number, month: number, day: number, isLeap: boolean}|null}
 */
function parseChineseLunarDate(dateStr) {
    const isLeap = dateStr.includes('闰');
    // 兼容 "年/月" 和 "-" 分隔符
    const cleanedStr = dateStr.replace('年', '-').replace('月', '-').replace('日', '').replace('闰', '');

    const parts = cleanedStr.split('-');
    if (parts.length !== 3) return null;

    let [yearPart, monthPart, dayPart] = parts;

    // 1. 解析年份
    const year = parseInt(
        yearPart.split('').map(char => CHINESE_CHAR_TO_NUMBER[char]).join(''),
        10
    );

    // 2. 解析月份
    const month = CHINESE_MONTH_TO_NUMBER[monthPart];

    // 3. [修正] 解析日期 (更健壮的逻辑)
    let day = 0;
    if (dayPart.startsWith('廿') || dayPart.startsWith('卅')) { // 处理 20-30
        day = CHINESE_DAY_MAP[dayPart[0]];
        day += CHINESE_CHAR_TO_NUMBER[dayPart[1]] || 0;
    } else if (dayPart.startsWith('十')) { // 处理 10-19
        day = 10;
        day += CHINESE_CHAR_TO_NUMBER[dayPart[1]] || 0;
    } else if (dayPart.startsWith('初')) { // 处理 1-9
        day = CHINESE_CHAR_TO_NUMBER[dayPart[1]] || 0;
    } else if (dayPart === '二十') {
        day = 20;
    } else if (dayPart === '三十') {
        day = 30;
    }


    if (isNaN(year) || !month || !day) return null;

    return { year, month, day, isLeap };
}


/**
 * 检测输入字符串的类型
 * @param {string} input - 用户输入
 * @returns {'gregorian' | 'lunar' | 'pillars'}
 */
export function detectInputType(input) {
    if (input.startsWith('lunar:')) {
        return 'lunar';
    }
    if (input.startsWith('pillars:') || (input.includes('-') && !input.includes('/') && !input.includes('.'))) {
        if (input.split('-').length === 4 || input.startsWith('pillars:')) {
             return 'pillars';
        }
    }
    return 'gregorian';
}

/**
 * 验证公历日期字符串格式
 * @param {string} dateStr - 公历日期字符串
 * @returns {boolean}
 */
export function validateGregorian(dateStr) {
    // 格式: YYYY-MM-DD HH:MM:SS
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    return regex.test(dateStr);
}

/**
 * 验证四柱干支的合法性
 * @param {string[]} pillars - 四柱数组
 * @returns {boolean}
 */
export function validatePillars(pillars) {
    if (!Array.isArray(pillars) || pillars.length !== 4) {
        return false;
    }
    return pillars.every(p => GAN_ZHI_CYCLE_SET.has(p)); // 使用常量
}

/**
 * [V2 - 彻底重写] 核心转换函数，将任何合法输入标准化为一个或多个公历日期时间字符串
 * 对应我们方案中的第一步 "findDates(userInput)"
 * @param {string} input - 用户输入
 * @returns {Promise<string[]>} - 一个或多个公历日期时间字符串组成的数组
 */
export async function normalizeToGregorian(input) {
    const type = detectInputType(input);

    switch (type) {
        case 'gregorian': {
            const fullDate = input.length === 16 ? `${input}:00` : input;
            if (!validateGregorian(fullDate)) {
                throw new Error('无效的公历日期格式。请输入 "YYYY-MM-DD HH:MM:SS" 或 "YYYY-MM-DD HH:MM" 格式。');
            }
            return [fullDate];
        }

        case 'lunar': {
            const content = input.substring(6).trim(); // "二〇〇二年八月十四 08:00"
            const lastSpaceIndex = content.lastIndexOf(' ');
            if (lastSpaceIndex === -1) {
                throw new Error('无效的农历格式，缺少时间部分。正确格式如 "lunar:二〇〇二年八月十四 08:00"。');
            }

            const datePartStr = content.substring(0, lastSpaceIndex); // "二〇〇二年八月十四"
            const timePartStr = content.substring(lastSpaceIndex + 1); // "08:00"

            let lunarData = parseChineseLunarDate(datePartStr);
            
            if (!lunarData) {
                 // 增加对数字格式的兼容
                const parts = datePartStr.split(/[-年月]/).filter(p => p);
                if (parts.length >= 3) {
                    lunarData = {
                        year: parseInt(parts[0], 10),
                        month: parseInt(parts[1], 10),
                        day: parseInt(parts[2], 10),
                        isLeap: datePartStr.includes('闰')
                    };
                } else {
                    throw new Error(`无法解析农历日期部分: "${datePartStr}"`);
                }
            }
            
            // 查询对应的公历年月日
            const gregorianDateParts = await databaseService.findGregorianDateByLunar(lunarData);
            
            if (!gregorianDateParts) {
                throw new Error(`输入的农历日期无效或不存在: "${datePartStr}"。请检查年份、月份、日期或闰月是否正确。`);
            }

            const { year, month, day } = gregorianDateParts;
            const time = timePartStr.length === 5 ? `${timePartStr}:00` : timePartStr; // 补全秒
            
            const gregorianDateTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${time}`;
            
            if (!validateGregorian(gregorianDateTime)) {
                 throw new Error(`根据农历转换后的公历日期格式不正确: ${gregorianDateTime}`);
            }

            return [gregorianDateTime];
        }

        case 'pillars': {
            const pillarStr = input.replace('pillars:', '').replace(/\s+/g, '-');
            const pillars = pillarStr.split('-');

            if (!validatePillars(pillars)) {
                throw new Error('无效的四柱干支。请确保每一柱都是合法的干支组合。');
            }

            const pillarObj = {
                year_pillar: pillars[0],
                month_pillar: pillars[1],
                day_pillar: pillars[2],
                hour_pillar: pillars[3],
            };

            const dates = await databaseService.findAllDatesByPillars(pillarObj);
            if (dates.length === 0) {
                throw new Error('未找到与该四柱匹配的公历日期。');
            }
            return dates;
        }

        default:
            throw new Error('无法识别的输入类型。');
    }
}