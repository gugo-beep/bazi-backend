// bazi-backend/src/auxiliaryCalculator.js

import * as databaseService from './databaseService.js';

// ... 核心数据表 (长生十二宫, 月令等) 保持不变 ...
const CHANG_SHENG_CYCLE = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
const CHANG_SHENG_START = {
    '甲': '亥', '丙': '寅', '戊': '寅', '庚': '巳', '壬': '申',
    '乙': '午', '丁': '酉', '己': '酉', '辛': '子', '癸': '卯'
};
const ZHI_CYCLE = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const YUE_LING_DATA = {
    '寅': [{ gan: '戊', days: 7 }, { gan: '丙', days: 7 }, { gan: '甲', days: 16 }], '卯': [{ gan: '甲', days: 10 }, { gan: '乙', days: 20 }], '辰': [{ gan: '乙', days: 9 }, { gan: '癸', days: 3 }, { gan: '戊', days: 18 }], '巳': [{ gan: '戊', days: 5 }, { gan: '庚', days: 9 }, { gan: '丙', days: 16 }], '午': [{ gan: '丙', days: 10 }, { gan: '己', days: 9 }, { gan: '丁', days: 11 }], '未': [{ gan: '丁', days: 9 }, { gan: '乙', days: 3 }, { gan: '己', days: 18 }], '申': [{ gan: '己', days: 7 }, { gan: '壬', days: 7 }, { gan: '庚', days: 16 }], '酉': [{ gan: '庚', days: 10 }, { gan: '辛', days: 20 }], '戌': [{ gan: '辛', days: 9 }, { gan: '丁', days: 3 }, { gan: '戊', days: 18 }], '亥': [{ gan: '戊', days: 7 }, { gan: '甲', days: 7 }, { gan: '壬', days: 16 }], '子': [{ gan: '壬', days: 10 }, { gan: '癸', days: 20 }], '丑': [{ gan: '癸', days: 9 }, { gan: '辛', days: 3 }, { gan: '己', days: 18 }]
};

function getChangShengStatus(gan, zhi) {
    const isYang = ['甲', '丙', '戊', '庚', '壬'].includes(gan);
    const startZhi = CHANG_SHENG_START[gan];
    const startIdx = ZHI_CYCLE.indexOf(startZhi);
    const targetIdx = ZHI_CYCLE.indexOf(zhi);
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