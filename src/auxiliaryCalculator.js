// bazi-backend/src/auxiliaryCalculator.js

import * as databaseService from './databaseService.js';
// 导入统一的常量
import {
    CHANG_SHENG_CYCLE,
    CHANG_SHENG_START,
    YUE_LING_DATA,
    ZHI, // ZHI_CYCLE 已在 constants.js 中定义为 ZHI
    YANG_GAN
} from './constants.js';


function getChangShengStatus(gan, zhi) {
    const isYang = YANG_GAN.includes(gan);
    const startZhi = CHANG_SHENG_START[gan];
    const startIdx = ZHI.indexOf(startZhi);
    const targetIdx = ZHI.indexOf(zhi);
    let diff = targetIdx - startIdx;
    if (isYang) { if (diff < 0) diff += 12; } else { diff = -diff; if (diff < 0) diff += 12; }
    return CHANG_SHENG_CYCLE[diff];
}

async function calculateYueLingSiLing(context) {
    const birthDate = new Date(context.gregorianDate);
    const monthPillar = context.baziProfile.monthPillar;
    const monthZhi = monthPillar.zhi.value;
    const jieTimeStr = await databaseService.getAdjacentSolarTerm(context.gregorianDate, 'before');
    if (!jieTimeStr) return;
    const jieDate = new Date(jieTimeStr);
    const diffMilliseconds = birthDate.getTime() - jieDate.getTime();
    const daysAfterJie = diffMilliseconds / (1000 * 60 * 60 * 24);
    const siLingRules = YUE_LING_DATA[monthZhi];
    if (!siLingRules) return;
    let cumulativeDays = 0;
    for (const rule of siLingRules) {
        cumulativeDays += rule.days;
        if (daysAfterJie <= cumulativeDays) {
            monthPillar.yueLingSiLing = rule.gan;
            return;
        }
    }
}

export async function calculateAuxiliaryFeatures(context) {
    const { yearPillar, monthPillar, dayPillar, hourPillar } = context.baziProfile;
    const dayGan = dayPillar.gan.value;

    // --- 1. [修正] 只为原局四柱计算【自坐】---
    yearPillar.ziZuo = getChangShengStatus(yearPillar.gan.value, yearPillar.zhi.value);
    monthPillar.ziZuo = getChangShengStatus(monthPillar.gan.value, monthPillar.zhi.value);
    dayPillar.ziZuo = getChangShengStatus(dayPillar.gan.value, dayPillar.zhi.value);
    hourPillar.ziZuo = getChangShengStatus(hourPillar.gan.value, hourPillar.zhi.value);

    // --- 2. [修正] 只为原局四柱计算【星运】---
    yearPillar.xingYun = getChangShengStatus(dayGan, yearPillar.zhi.value);
    monthPillar.xingYun = getChangShengStatus(dayGan, monthPillar.zhi.value);
    dayPillar.xingYun = getChangShengStatus(dayGan, dayPillar.zhi.value);
    hourPillar.xingYun = getChangShengStatus(dayGan, hourPillar.zhi.value);
    
    // --- 3. 计算【月令司令】---
    await calculateYueLingSiLing(context);
}