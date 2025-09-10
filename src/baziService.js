// src/baziService.js

import * as databaseService from './databaseService.js';
import * as inputProcessor from './inputProcessor.js';
import NA_YIN from '../data/NA_YIN.js';
import SHI_SHEN_GAN from '../data/SHI_SHEN_GAN.js';
import ZHI_HIDE_GAN from '../data/ZHI_HIDE_GAN.js';
import { calculateHarmRelations } from './harmCalculator.js';
import { calculateShensha } from './shenshaCalculator.js';
import { calculateAuxiliaryFeatures } from './auxiliaryCalculator.js';
// 导入常量
import { GENDER, PILLAR_TYPE, GAN_ZHI_TYPE, ID, SHEN_SHEN } from './constants.js';

// ... 文件顶部的辅助工具代码保持不变 ...
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const GAN_ZHI_CYCLE = Array.from({ length: 60 }, (_, i) => GAN[i % 10] + ZHI[i % 12]);

function getNextGanZhi(ganzhi, step = 1) {
  const currentIndex = GAN_ZHI_CYCLE.indexOf(ganzhi);
  if (currentIndex === -1) return null;
  const nextIndex = (currentIndex + step + 60) % 60;
  return GAN_ZHI_CYCLE[nextIndex];
}

function calculateCangGan(zhi, dayGan) {
  const hideGans = ZHI_HIDE_GAN[zhi] || [];
  return hideGans.map(item => ({
    gan: item.gan,
    type: item.type,
    shishen: SHI_SHEN_GAN[dayGan][item.gan]
  }));
}

async function calculateQiYun(gregorianDateStr, gender, yearGan) {
  const birthDate = new Date(gregorianDateStr);
  const birthYear = birthDate.getFullYear();
  const yangGan = ['甲', '丙', '戊', '庚', '壬'];
  const isYangNian = yangGan.includes(yearGan);
  // 使用常量
  const isShunPai = (isYangNian && gender === GENDER.MALE) || (!isYangNian && gender === GENDER.FEMALE);

  const jieqiData = await databaseService.getJieQiInRange(birthYear - 1, birthYear + 1);
  if (!jieqiData || jieqiData.length === 0) {
      throw new Error(`无法为年份 ${birthYear} 获取节气数据。`);
  }

  const allJieQi = jieqiData.map(j => new Date(j.exact_datetime)).sort((a, b) => a - b);
  
  let targetJieQiDate;
  if (isShunPai) {
    targetJieQiDate = allJieQi.find(jqDate => jqDate > birthDate);
  } else {
    targetJieQiDate = allJieQi.reverse().find(jqDate => jqDate < birthDate);
  }

  if (!targetJieQiDate) throw new Error("无法找到对应的节气时间。");

  const diffMilliseconds = Math.abs(targetJieQiDate.getTime() - birthDate.getTime());
  
  const totalMinutes = diffMilliseconds / 60000;
  const years = Math.floor(totalMinutes / 4320);
  const remainingMinutesAfterYears = totalMinutes % 4320;
  const months = Math.floor(remainingMinutesAfterYears / 360);
  const remainingMinutesAfterMonths = remainingMinutesAfterYears % 360;
  const days = Math.floor(remainingMinutesAfterMonths / 12);
  const remainingMinutesAfterDays = remainingMinutesAfterMonths % 12;
  const hours = Math.floor(remainingMinutesAfterDays * 2);

  const qiYunDate = new Date(birthDate.getTime());
  qiYunDate.setFullYear(qiYunDate.getFullYear() + years);
  qiYunDate.setMonth(qiYunDate.getMonth() + months);
  qiYunDate.setDate(qiYunDate.getDate() + days);
  qiYunDate.setHours(qiYunDate.getHours() + hours);
  const formattedQiYunDate = `${qiYunDate.getFullYear()}-${String(qiYunDate.getMonth() + 1).padStart(2, '0')}-${String(qiYunDate.getDate()).padStart(2, '0')} ${String(qiYunDate.getHours()).padStart(2, '0')}:00:00`;

  const liChunTime = await databaseService.getLiChunForYear(birthYear);
  if (!liChunTime) {
      throw new Error(`无法获取 ${birthYear} 年的立春时间。`);
  }
  const liChunDate = new Date(liChunTime);
  let baziYear = birthYear;
  if (birthDate < liChunDate) {
      baziYear = birthYear - 1;
  }
  
  return {
    startAge: years + 1,
    startYear: birthDate.getFullYear() + years,
    isShunPai,
    baziYear,
    exactQiYunDate: formattedQiYunDate 
  };
}

async function generateDayun(birthDateStr, pillars, dayGan, qiYunInfo) {
    const { month_pillar, hour_pillar } = pillars;
    const step = qiYunInfo.isShunPai ? 1 : -1;

    const ganInfoCache = {};
    Object.keys(SHI_SHEN_GAN[dayGan]).forEach(gan => {
        ganInfoCache[gan] = { shishen: SHI_SHEN_GAN[dayGan][gan] };
    });
    const zhiInfoCache = {};
    Object.keys(ZHI_HIDE_GAN).forEach(zhi => {
        zhiInfoCache[zhi] = { canggan: calculateCangGan(zhi, dayGan) };
    });

    const result = [];
    let currentDaYunGanZhi = month_pillar;
    const birthYearGanZhi = GAN_ZHI_CYCLE[(qiYunInfo.baziYear - 1984 + 60) % 60];

    for (let i = 0; i < 10; i++) {
        if (i === 0) {
            const qiyunqian = {
                // 使用常量
                id: ID.QIYUNQIAN, type: PILLAR_TYPE.QIYUNQIAN, value: null, gan: null, zhi: null, nayin: null, shensha: [],
                start_year: new Date(birthDateStr).getFullYear(),
                end_year: qiYunInfo.startYear - 1,
                start_age: 1,
                liunian: []
            };
            let currentLiuNianGanZhi = birthYearGanZhi;
            let currentXiaoYunGanZhi = hour_pillar;
            for (let j = 0; j < qiYunInfo.startAge - 1; j++) {
                const age = j + 1;
                const year = qiyunqian.start_year + j;
                currentXiaoYunGanZhi = getNextGanZhi(currentXiaoYunGanZhi, step);
                const liuNianGan = currentLiuNianGanZhi.substring(0, 1);
                const liuNianZhi = currentLiuNianGanZhi.substring(1);
                const xiaoYunGan = currentXiaoYunGanZhi.substring(0, 1);
                const xiaoYunZhi = currentXiaoYunGanZhi.substring(1);
                qiyunqian.liunian.push({
                    id: `ln0_${j}p`, type: PILLAR_TYPE.LIUNIAN, value: currentLiuNianGanZhi, nayin: NA_YIN[currentLiuNianGanZhi], shensha: [], year, age,
                    gan: { id: `ln0_${j}g`, type: GAN_ZHI_TYPE.LIUNIAN_GAN, value: liuNianGan, shishen: ganInfoCache[liuNianGan].shishen, shensha: [] },
                    zhi: { id: `ln0_${j}z`, type: GAN_ZHI_TYPE.LIUNIAN_ZHI, value: liuNianZhi, canggan: zhiInfoCache[liuNianZhi].canggan, shensha: [] },
                    xiaoYun: {
                      id: `xy0_${j}p`, type: PILLAR_TYPE.XIAOYUN, value: currentXiaoYunGanZhi, nayin: NA_YIN[currentXiaoYunGanZhi], shensha: [],
                      gan: { id: `xy0_${j}g`, type: GAN_ZHI_TYPE.XIAOYUN_GAN, value: xiaoYunGan, shishen: ganInfoCache[xiaoYunGan].shishen, shensha: [] },
                      zhi: { id: `xy0_${j}z`, type: GAN_ZHI_TYPE.XIAOYUN_ZHI, value: xiaoYunZhi, canggan: zhiInfoCache[xiaoYunZhi].canggan, shensha: [] }
                    }
                });
                currentLiuNianGanZhi = getNextGanZhi(currentLiuNianGanZhi, 1);
            }
            result.push(qiyunqian);
            continue;
        }
        currentDaYunGanZhi = getNextGanZhi(currentDaYunGanZhi, step);
        const daYunStartAge = qiYunInfo.startAge + (i - 1) * 10;
        const daYunStartYear = qiYunInfo.startYear + (i - 1) * 10;
        const daYunGan = currentDaYunGanZhi.substring(0, 1);
        const daYunZhi = currentDaYunGanZhi.substring(1);
        const daYunPillar = {
            id: `dy${i}p`, type: PILLAR_TYPE.DAYUN, value: currentDaYunGanZhi, nayin: NA_YIN[currentDaYunGanZhi], shensha: [],
            start_year: daYunStartYear, end_year: daYunStartYear + 9, start_age: daYunStartAge,
            gan: { id: `dy${i}g`, type: GAN_ZHI_TYPE.DAYUN_GAN, value: daYunGan, shishen: ganInfoCache[daYunGan].shishen, shensha: [] },
            zhi: { id: `dy${i}z`, type: GAN_ZHI_TYPE.DAYUN_ZHI, value: daYunZhi, canggan: zhiInfoCache[daYunZhi].canggan, shensha: [] },
            liunian: []
        };
        let currentLiuNianGanZhi = getNextGanZhi(birthYearGanZhi, daYunStartAge - 1);
        for (let j = 0; j < 10; j++) {
            const liuNianGan = currentLiuNianGanZhi.substring(0, 1);
            const liuNianZhi = currentLiuNianGanZhi.substring(1);
            daYunPillar.liunian.push({
                id: `ln${i}_${j}p`, type: PILLAR_TYPE.LIUNIAN, value: currentLiuNianGanZhi, nayin: NA_YIN[currentLiuNianGanZhi], shensha: [],
                year: daYunStartYear + j, age: daYunStartAge + j, xiaoYun: null,
                gan: { id: `ln${i}_${j}g`, type: GAN_ZHI_TYPE.LIUNIAN_GAN, value: liuNianGan, shishen: ganInfoCache[liuNianGan].shishen, shensha: [] },
                zhi: { id: `ln${i}_${j}z`, type: GAN_ZHI_TYPE.LIUNIAN_ZHI, value: liuNianZhi, canggan: zhiInfoCache[liuNianZhi].canggan, shensha: [] }
            });
            currentLiuNianGanZhi = getNextGanZhi(currentLiuNianGanZhi, 1);
        }
        result.push(daYunPillar);
    }
    return result;
}

function generateOriginalPillar(pillarType, pillarStr, dayGan) {
  const gan = pillarStr.substring(0, 1);
  const zhi = pillarStr.substring(1, 2);
  const nayin = NA_YIN[pillarStr];
  
  let shishenGan, idPrefix, typeText, ganTypeText, zhiTypeText;

  // 使用常量替换硬编码字符串
  switch(pillarType) {
    case 'year':
      idPrefix = 'y'; 
      typeText = PILLAR_TYPE.YEAR; 
      ganTypeText = GAN_ZHI_TYPE.YEAR_GAN; 
      zhiTypeText = GAN_ZHI_TYPE.YEAR_ZHI;
      shishenGan = SHI_SHEN_GAN[dayGan][gan];
      break;
    case 'month':
      idPrefix = 'm'; 
      typeText = PILLAR_TYPE.MONTH; 
      ganTypeText = GAN_ZHI_TYPE.MONTH_GAN; 
      zhiTypeText = GAN_ZHI_TYPE.MONTH_ZHI;
      shishenGan = SHI_SHEN_GAN[dayGan][gan];
      break;
    case 'day':
      idPrefix = 'd'; 
      typeText = PILLAR_TYPE.DAY; 
      ganTypeText = GAN_ZHI_TYPE.DAY_GAN; 
      zhiTypeText = GAN_ZHI_TYPE.DAY_ZHI;
      shishenGan = SHEN_SHEN.DAY_MASTER;
      break;
    case 'hour':
      idPrefix = 't'; 
      typeText = PILLAR_TYPE.HOUR; 
      ganTypeText = GAN_ZHI_TYPE.HOUR_GAN; 
      zhiTypeText = GAN_ZHI_TYPE.HOUR_ZHI;
      shishenGan = SHI_SHEN_GAN[dayGan][gan];
      break;
    default:
        // 添加一个默认处理，增强代码健壮性
        throw new Error(`未知的四柱类型: ${pillarType}`);
  }

  const canggan = calculateCangGan(zhi, dayGan);
  return {
    id: `${idPrefix}p`, type: typeText, value: pillarStr, nayin: nayin, shensha: [],
    gan: { id: `${idPrefix}g`, type: ganTypeText, value: gan, shishen: shishenGan, shensha: [] },
    zhi: { id: `${idPrefix}z`, type: zhiTypeText, value: zhi, canggan: canggan, shensha: [] }
  };
}

function createCalculationContext(baziProfile, gender, gregorianDate) {
  const baziIndex = {};
  const flatMap = new Map();
  const addToIndex = (value, id) => {
    if (!baziIndex[value]) baziIndex[value] = [];
    if (!baziIndex[value].includes(id)) baziIndex[value].push(id);
  };
  const processPillar = (p, prefix) => {
    if (!p) return;
    if (p.value) flatMap.set(`${prefix}Pillar`, p.value);
    if (p.gan && p.gan.value) {
      addToIndex(p.gan.value, p.gan.id);
      flatMap.set(`${prefix}Gan`, p.gan.value);
    }
    if (p.zhi && p.zhi.value) {
      addToIndex(p.zhi.value, p.zhi.id);
      flatMap.set(`${prefix}Zhi`, p.zhi.value);
    }
    if (p.nayin) flatMap.set(`${prefix}NaYin`, p.nayin);
  };
  processPillar(baziProfile.yearPillar, 'year');
  processPillar(baziProfile.monthPillar, 'month');
  processPillar(baziProfile.dayPillar, 'day');
  processPillar(baziProfile.hourPillar, 'hour');
  baziProfile.dayun.forEach(dayun => {
    processPillar(dayun, dayun.id);
    if (dayun.liunian) {
      dayun.liunian.forEach(liunian => {
        processPillar(liunian, liunian.id);
        if (liunian.xiaoYun) {
          processPillar(liunian.xiaoYun, liunian.xiaoYun.id);
        }
      });
    }
  });
  return { baziProfile, baziIndex, flatMap, gender, gregorianDate };
}

async function calculateBaziProfileForSingleDate(gregorianDate, gender) {
  const pillarsFromDb = await databaseService.getBaziPillars(gregorianDate);
  if (!pillarsFromDb) {
      throw new Error(`无法从数据库中找到日期 ${gregorianDate} 对应的四柱信息。`);
  }
  
  const dayGan = pillarsFromDb.day_pillar.substring(0, 1);
  const yearGan = pillarsFromDb.year_pillar.substring(0,1);

  const qiYunInfo = await calculateQiYun(gregorianDate, gender, yearGan);

  const yearPillar = generateOriginalPillar('year', pillarsFromDb.year_pillar, dayGan);
  const monthPillar = generateOriginalPillar('month', pillarsFromDb.month_pillar, dayGan);
  const dayPillar = generateOriginalPillar('day', pillarsFromDb.day_pillar, dayGan);
  const hourPillar = generateOriginalPillar('hour', pillarsFromDb.hour_pillar, dayGan);
  
  const dayun = await generateDayun(gregorianDate, pillarsFromDb, dayGan, qiYunInfo);
  
  const baziProfile = { yearPillar, monthPillar, dayPillar, hourPillar, dayun };
  
  const context = createCalculationContext(baziProfile, gender, gregorianDate);
  const relations = calculateHarmRelations(context);
  calculateShensha(context);
  
  await calculateAuxiliaryFeatures(context);

  const finalOutput = {
    profile: {
      gregorianDate,
      gender,
      dayMaster: dayPillar.gan.value,
      exactQiYunDate: qiYunInfo.exactQiYunDate,
      lunarDate: pillarsFromDb.lunar_date_str,
      taiYuan: pillarsFromDb.tai_yuan,
      mingGong: pillarsFromDb.ming_gong,
      shenGong: pillarsFromDb.shen_gong
    },
    yuanju: {
      year: baziProfile.yearPillar,
      month: baziProfile.monthPillar,
      day: baziProfile.dayPillar,
      hour: baziProfile.hourPillar
    },
    dayun: baziProfile.dayun,
    relations: relations,
  };

  return finalOutput;
}

export async function findPossibleGregorianDates(userInput) {
    const gregorianDates = await inputProcessor.normalizeToGregorian(userInput);
    return gregorianDates;
}

export async function generateBaziProfile(chosenDate, gender) {
    return await calculateBaziProfileForSingleDate(chosenDate, gender);
}