import { jest } from '@jest/globals';

// 1. 定义一个全新的、更强大的模拟神煞规则集
const mockShenshaRules = [
    // --- 测试场景 1: 带复杂前提条件和分支的神煞 (模拟“绞煞”) ---
    {
        name: '模拟绞煞',
        branches: [
            {
                preconditions: {
                    logic: 'or',
                    groups: [
                        [{ on: 'gender', value: ['女'] }, { on: 'dayGan', value: ['辛'] }], // 阴女
                        [{ on: 'gender', value: ['男'] }, { on: 'dayGan', value: ['庚'] }]  // 阳男
                    ]
                },
                rules: [{ trigger: { on: 'yearZhi', value: ['申'] }, judgment: { on: 'allZhi', value: ['巳'] } }]
            }
        ]
    },
    // --- 测试场景 2: 带 allPillar 判断的神煞 (模拟“魁罡”) ---
    {
        name: '模拟魁罡',
        rules: [
            { trigger: { on: ['dayPillar'], value: ['庚辰'] }, judgment: { on: 'allPillar', value: ['庚辰', '壬辰'] } }
        ]
    },
    // --- 测试场景 3: 带普通前提条件和 exclude_trigger 的神煞 (模拟“华盖”) ---
    {
        name: '模拟华盖',
        rules: [
            { trigger: { on: ['dayZhi'], value: ['戌'] }, judgment: { on: 'allZhi', value: ['戌'], exclude_trigger: true } }
        ]
    }
];

// 2. 模拟 shenshaRules.js 的导入
jest.unstable_mockModule('../data/shenshaRules.js', () => ({
    default: mockShenshaRules,
}));

// 3. 在所有 mock 设置完毕后，导入我们要测试的模块
const { calculateShensha, findElementById } = await import('./shenshaCalculator.js');


/**
 * [最终修正版] 辅助函数：创建一个与 baziService 完全一致的模拟 context
 */
const createMockContext = (overrides = {}) => {
    const baseProfile = {
        yearPillar:  { id: 'yp', value: '甲申', gan: { id: 'yg', value: '甲', shensha: [] }, zhi: { id: 'yz', value: '申', shensha: [] }, shensha: [] },
        monthPillar: { id: 'mp', value: '丙寅', gan: { id: 'mg', value: '丙', shensha: [] }, zhi: { id: 'mz', value: '寅', shensha: [] }, shensha: [] },
        dayPillar:   { id: 'dp', value: '辛巳', gan: { id: 'dg', value: '辛', shensha: [] }, zhi: { id: 'dz', value: '巳', shensha: [] }, shensha: [] },
        hourPillar:  { id: 'tp', value: '庚寅', gan: { id: 'tg', value: '庚', shensha: [] }, zhi: { id: 'tz', value: '寅', shensha: [] }, shensha: [] },
        dayun: []
    };

    const baseFlatMap = new Map([
        ['yearGan', '甲'], ['yearZhi', '申'], ['yearPillar', '甲申'],
        ['monthGan', '丙'], ['monthZhi', '寅'], ['monthPillar', '丙寅'],
        ['dayGan', '辛'], ['dayZhi', '巳'], ['dayPillar', '辛巳'],
        ['hourGan', '庚'], ['hourZhi', '寅'], ['hourPillar', '庚寅'],
    ]);
    
    // 合并覆盖值
    const finalProfile = { ...baseProfile, ...overrides.baziProfile };
    const finalFlatMap = new Map([...baseFlatMap, ...(overrides.flatMap || new Map())]);

    return {
        baziProfile: finalProfile,
        flatMap: finalFlatMap,
        baziIndex: overrides.baziIndex || { '巳': ['dz'], '申': ['yz'] },
        gender: overrides.gender || '女',
    };
};

describe('神煞计算器 (shenshaCalculator) - 最终测试版', () => {

    it('应该能正确处理带复杂前提条件的“模拟绞煞”', () => {
        // 条件: 女命, 日干为辛, 年支为申, 判断地支巳
        const context = createMockContext({ gender: '女' });
        
        calculateShensha(context);

        // 断言: 日支'巳'应该有'模拟绞煞'
        expect(context.baziProfile.dayPillar.zhi.shensha).toContain('模拟绞煞');
    });

    it('当不满足复杂前提条件时，不应该计算神煞', () => {
        // 条件: 将性别改为'男'，不满足“阴女”或“阳男”的任何一个条件
        const context = createMockContext({ gender: '男' });

        calculateShensha(context);

        // 断言: 所有神煞数组都应该是空的
        expect(context.baziProfile.dayPillar.zhi.shensha).toEqual([]);
    });

    it('应该能正确处理 allPillar 判断', () => {
        // 条件: 将日柱改为'庚辰'来触发规则
        const context = createMockContext({
            baziProfile: {
                dayPillar: { id: 'dp', value: '庚辰', gan: { id: 'dg', value: '庚', shensha: [] }, zhi: { id: 'dz', value: '辰', shensha: [] }, shensha: [] }
            },
            flatMap: new Map([['dayPillar', '庚辰']]),
            baziIndex: {}
        });
        
        // 为了让判断生效，我们在大运里也放一个'壬辰'
        context.baziProfile.dayun.push({ id: 'dy1p', value: '壬辰', shensha: [] });

        calculateShensha(context);
        
        // 断言: 日柱和这个大运柱都应该有'模拟魁罡'
        expect(context.baziProfile.dayPillar.shensha).toContain('模拟魁罡');
        expect(context.baziProfile.dayun[0].shensha).toContain('模拟魁罡');
    });

    it('应该能正确处理 exclude_trigger', () => {
        // 条件: 日支为戌，且八字中还有另一个戌（年支）
        const context = createMockContext({
            baziProfile: {
                yearPillar: { id: 'yp', value: '甲戌', gan: { id: 'yg', value: '甲', shensha: [] }, zhi: { id: 'yz', value: '戌', shensha: [] }, shensha: [] },
                dayPillar:  { id: 'dp', value: '庚戌', gan: { id: 'dg', value: '庚', shensha: [] }, zhi: { id: 'dz', value: '戌', shensha: [] }, shensha: [] }
            },
            flatMap: new Map([['dayZhi', '戌']]), // 由日支触发
            baziIndex: { '戌': ['yz', 'dz'] }
        });
        
        calculateShensha(context);

        // 断言: 触发者(日支)不应有神煞，而另一个(年支)应该有
        expect(context.baziProfile.dayPillar.zhi.shensha).not.toContain('模拟华盖');
        expect(context.baziProfile.yearPillar.zhi.shensha).toContain('模拟华盖');
    });
});