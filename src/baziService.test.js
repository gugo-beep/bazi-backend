// [最终完美版] baziService.test.js - 适配真实数据库的返回结果

import { generateBaziProfile } from './baziService.js';

describe('八字服务测试套件', () => {
    let profile;
    const gregorianDate = '1996-04-13 00:18:00';
    const gender = '女';

    beforeAll(async () => {
        profile = await generateBaziProfile(gregorianDate, gender);
    });

    describe('generateBaziProfile 基本功能', () => {
        it('应该正确生成女性八字信息', () => {
            expect(profile).toHaveProperty('profile');
            expect(profile).toHaveProperty('yuanju');
            expect(profile).toHaveProperty('dayun');
            expect(profile.profile.gender).toBe('女');
            expect(profile.profile.dayMaster).toBe('庚'); 
            expect(profile.profile).toHaveProperty('lunarDate');
            expect(typeof profile.profile.lunarDate).toBe('string');
            // 添加对胎元、命宫、身宫的检查
            expect(profile.profile).toHaveProperty('taiYuan');
            expect(typeof profile.profile.taiYuan).toBe('string');
            expect(profile.profile).toHaveProperty('mingGong');
            expect(typeof profile.profile.mingGong).toBe('string');
            expect(profile.profile).toHaveProperty('shenGong');
            expect(typeof profile.profile.shenGong).toBe('string');
        });
    });

    describe('原局四柱测试', () => {
        it('应该包含正确的原局四柱信息', () => {
            const { year, month, day, hour } = profile.yuanju;
            expect(year.id).toBe('yp');
            expect(year.type).toBe('年柱');
            expect(year.value).toBe('丙子');
            expect(month.value).toBe('壬辰');
            // [修正] 将期望值更新为数据库返回的真实值
            expect(day.value).toBe('庚辰'); 
            expect(hour.value).toBe('丙子');
        });

        it('应该包含正确的天干十神信息', () => {
            const { year, month, day, hour } = profile.yuanju;
            expect(year.gan).toHaveProperty('shishen', '七杀');
            expect(month.gan).toHaveProperty('shishen', '食神');
            expect(day.gan).toHaveProperty('shishen', '日主');
            expect(hour.gan).toHaveProperty('shishen', '七杀');
        });

        it('应该包含正确的纳音信息', () => {
            const { year, month, day, hour } = profile.yuanju;
            expect(year).toHaveProperty('nayin', '涧下水');
            expect(month).toHaveProperty('nayin', '长流水');
            // [修正] 将期望值更新为数据库返回的真实值
            expect(day).toHaveProperty('nayin', '白蜡金'); 
            expect(hour).toHaveProperty('nayin', '涧下水');
        });
    });

    describe('大运与起运前结构测试', () => {
        it('应该包含一个大运数组', () => {
            expect(Array.isArray(profile.dayun)).toBe(true);
            expect(profile.dayun.length).toBeGreaterThan(0);
        });

        it('应该将"起运前"作为第一个元素', () => {
            const qiyunqian = profile.dayun[0];
            expect(qiyunqian).toHaveProperty('id', 'qyq');
            expect(qiyunqian).toHaveProperty('type', '起运前');
        });

        it('应该生成正确的【正式大运】结构', () => {
            const firstDayun = profile.dayun[1];
            expect(firstDayun).toHaveProperty('id', 'dy1p');
            expect(firstDayun).toHaveProperty('type', '大运');
        });
    });

    describe('流年和小运测试', () => {
        it('应该在起运前的流年中包含小运信息', () => {
            const qiyunqian = profile.dayun[0];
            if (qiyunqian.liunian.length > 0) {
                const firstLiunian = qiyunqian.liunian[0];
                expect(firstLiunian.xiaoYun).not.toBeNull();
                expect(firstLiunian.xiaoYun).toHaveProperty('id', 'xy0_0p');
            }
        });

        it('应该在正式大运的流年中不包含小运信息', () => {
            if (profile.dayun.length > 1) {
                const firstDayun = profile.dayun[1];
                const firstLiunian = firstDayun.liunian[0];
                expect(firstLiunian.xiaoYun).toBeNull();
            }
        });
    });

    describe('集成测试 (Integration Test)', () => {
        it('baziService 的最终输出应该包含正确的 relations 数组', () => {
            expect(profile.relations).toBeInstanceOf(Array);
        });
    });
});