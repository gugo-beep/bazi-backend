// src/constants.js

// --- 基础分类 ---

export const GENDER = {
    MALE: '男',
    FEMALE: '女',
};

export const PILLAR_TYPE = {
    YEAR: '年柱',
    MONTH: '月柱',
    DAY: '日柱',
    HOUR: '时柱',
    DAYUN: '大运',
    LIUNIAN: '流年',
    XIAOYUN: '小运',
    QIYUNQIAN: '起运前',
};

export const GAN_ZHI_TYPE = {
    YEAR_GAN: '年干', YEAR_ZHI: '年支',
    MONTH_GAN: '月干', MONTH_ZHI: '月支',
    DAY_GAN: '日干', DAY_ZHI: '日支',
    HOUR_GAN: '时干', HOUR_ZHI: '时支',
    DAYUN_GAN: '大运干', DAYUN_ZHI: '大运支',
    LIUNIAN_GAN: '流年干', LIUNIAN_ZHI: '流年支',
    XIAOYUN_GAN: '小运干', XIAOYUN_ZHI: '小运支',
};

export const ID = {
    QIYUNQIAN: 'qyq',
};

export const SHEN_SHEN = {
    DAY_MASTER: '日主',
};


// --- 天干地支核心数据 ---

export const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 阳天干
export const YANG_GAN = ['甲', '丙', '戊', '庚', '壬'];

// 60甲子循环
export const GAN_ZHI_CYCLE = Array.from({ length: 60 }, (_, i) => GAN[i % 10] + ZHI[i % 12]);
export const GAN_ZHI_CYCLE_SET = new Set(GAN_ZHI_CYCLE);


// --- Unicode 排序常量 (用于 harmCalculator) ---

export const GAN_ORDER = ["丁", "丙", "乙", "壬", "己", "庚", "戊", "甲", "癸", "辛"];
export const ZHI_ORDER = ["丑", "亥", "午", "卯", "子", "寅", "巳", "戌", "未", "申", "辰", "酉"];

const createOrderMap = () => {
    const map = new Map();
    GAN_ORDER.forEach((char, index) => map.set(char, index));
    ZHI_ORDER.forEach((char, index) => map.set(char, index));
    return map;
};
export const CHAR_ORDER_MAP = createOrderMap();


// --- 中文解析常量 (用于 inputProcessor) ---

export const CHINESE_CHAR_TO_NUMBER = { '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
export const CHINESE_MONTH_TO_NUMBER = { '正': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '冬': 11, '腊': 12 };
export const CHINESE_DAY_MAP = { '初': 0, '十': 10, '廿': 20, '卅': 30 };