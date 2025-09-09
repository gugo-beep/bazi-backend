// gugo-beep/backend/backend-4be0ba13368314c6714a4251deaaa86cb07287d8/src/inputProcessor.js

import * as databaseService from './databaseService.js';

// 60甲子表，用于验证四柱输入的合法性
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const GAN_ZHI_CYCLE = new Set(Array.from({ length: 60 }, (_, i) => GAN[i % 10] + ZHI[i % 12]));

// 任务 1.2 (修正): 正则表达式现在要求完整的时和分
const lunarRegex = /^lunar:(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(-true)?$/;

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
 * 任务 1.3.1: 验证公历日期字符串格式
 * @param {string} dateStr - 公历日期字符串
 * @returns {boolean} 是否有效
 */
export function validateGregorian(dateStr) {
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    return regex.test(dateStr);
}

/**
 * 任务 1.3.2 (修正): 验证从 lunar: 字符串解析出的数据，包括小时和分钟
 * @param {object | null} lunarData - { year, month, day, hour, minute, isLeap }
 * @returns {boolean} 是否有效
 */
export function validateLunar(lunarData) {
    if (!lunarData) return false;
    const { year, month, day, hour, minute } = lunarData;

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 30) return false; 
    if (hour < 0 || hour > 23) return false;
    if (minute < 0 || minute > 59) return false;
    
    return true;
}

/**
 * 任务 1.3.3: 验证四柱干支的合法性
 * @param {string[]} pillars - 四柱数组
 * @returns {boolean} 是否有效
 */
export function validatePillars(pillars) {
    if (!Array.isArray(pillars) || pillars.length !== 4) {
        return false;
    }
    return pillars.every(p => GAN_ZHI_CYCLE.has(p));
}

/**
 * 任务 1.4 (重写): 核心转换函数，将任何合法输入标准化为一个或多个公历日期
 * @param {string} input - 用户输入
 * @returns {Promise<string[]>} - 一个或多个公历日期字符串组成的数组
 */
export async function normalizeToGregorian(input) {
    const type = detectInputType(input);

    switch (type) {
        case 'gregorian': {
            const fullDate = input.length === 16 ? `${input}:00` : input;
            if (!validateGregorian(fullDate)) {
                throw new Error('无效的公历日期格式。请输入 "YYYY-MM-DD HH:MM:SS" 格式。');
            }
            return [fullDate];
        }

        case 'lunar': {
            const match = input.match(lunarRegex);
            if (!match) {
                 throw new Error('无效的农历日期格式。请输入 "lunar:YYYY-MM-DD HH:MM" 格式，例如 "lunar:2004-02-13 04:20"。');
            }
            
            const [, year, month, day, hour, minute, isLeapStr] = match;
            
            const lunarData = {
                year: parseInt(year, 10),
                month: parseInt(month, 10),
                day: parseInt(day, 10),
                hour: parseInt(hour, 10),
                minute: parseInt(minute, 10),
                isLeap: !!isLeapStr
            };

            if (!validateLunar(lunarData)) {
                throw new Error('无效的农历日期数据（例如月份超出1-12范围）。');
            }

            const dates = await databaseService.findDatesByLunar(lunarData);
            if (dates.length === 0) {
                throw new Error('未找到与该农历日期匹配的公历日期。请检查日期是否有效（如闰月是否存在）。');
            }
            return dates;
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

            const dates = await databaseService.findDatesByPillars(pillarObj);
            if (dates.length === 0) {
                throw new Error('未找到与该四柱匹配的公历日期。');
            }
            return dates;
        }

        default:
            throw new Error('无法识别的输入类型。');
    }
}