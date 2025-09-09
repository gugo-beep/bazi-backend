const mockHarmRules = {
  dizhi_2_char: {
    "丑子": { "type": ["六合"], "result": "土" },
    "亥寅": { "type": ["六合", "破"], "result": "木" },
    "辰酉": { "type": ["六合"], "result": "金" },
  },
  dizhi_3_char: {
    "丑戌未": { "type": ["三刑"], "result": "土" },
  },
};

// 在ES模块中使用Jest mock的方法
import { jest } from '@jest/globals';
jest.unstable_mockModule('../data/harmRules.js', () => {
  return { default: mockHarmRules }; // 返回包含default属性的对象
});

// 由于ES模块的异步加载特性，我们需要先执行mock，然后再导入被测试的模块
let calculateHarmRelations;

beforeAll(async () => {
  const module = await import('./harmCalculator.js');
  calculateHarmRelations = module.calculateHarmRelations;
});

describe('刑冲合害计算器 (harmCalculator)', () => {

  it('应该能正确计算简单的二维关系（地支六合）', () => {
    const mockContext = {
      baziIndex: { "子": ["yz"], "丑": ["dz", "dy1z"] }
    };
    const relations = calculateHarmRelations(mockContext);
    expect(relations).toHaveLength(2);
    expect(relations).toContainEqual({
      type: '六合', elements: ['dz', 'yz'].sort(), result: '土'
    });
    expect(relations).toContainEqual({
      type: '六合', elements: ['dy1z', 'yz'].sort(), result: '土'
    });
  });
  
  // ... 其他旧的测试用例保持不变 ...

  it('当命盘中不存在匹配的干支时，应该返回空数组', () => {
    const mockContext = {
      baziIndex: { "甲": ["yg"], "乙": ["mg"] }
    };
    const relations = calculateHarmRelations(mockContext);
    expect(relations).toHaveLength(0);
  });

  // --- NEW: 增加针对"起运前流年-小运"关系的新测试 ---
  describe('起运前流年与小运的关系测试', () => {
    it('应该能正确找到匹配索引的【流年-小运】关系', () => {
      // 场景: 流年地支ln0_2z为"辰"，小运地支xy0_2z为"酉"
      const mockContext = {
        baziIndex: {
          "辰": ["ln0_2z"],
          "酉": ["xy0_2z"]
        }
      };
      const relations = calculateHarmRelations(mockContext);
      expect(relations).toHaveLength(1); // 应该找到一组 "辰酉" 六合
      expect(relations[0]).toEqual({
        type: '六合',
        elements: ['ln0_2z', 'xy0_2z'].sort(),
        result: '金'
      });
    });

    it('当流年与小运索引不匹配时，不应该生成关系', () => {
      // 场景: 流年地支ln0_2z为"辰"，但小运地支xy0_3z为"酉"（索引不匹配）
      const mockContext = {
        baziIndex: {
          "辰": ["ln0_2z"],
          "酉": ["xy0_3z"] // 索引是3，不匹配
        }
      };
      const relations = calculateHarmRelations(mockContext);
      expect(relations).toHaveLength(0); // 不应该找到任何关系
    });

    it('正式大运的流年不应该与小运发生关系', () => {
      // 场景: 正式大运流年ln1_2z为"辰"，小运地支xy0_2z为"酉"
      const mockContext = {
        baziIndex: {
          "辰": ["ln1_2z"], // outer index 是 1，不是起运前
          "酉": ["xy0_2z"]
        }
      };
      const relations = calculateHarmRelations(mockContext);
      expect(relations).toHaveLength(0); // 不应该找到任何关系
    });
  });
});