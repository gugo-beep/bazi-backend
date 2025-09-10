import harmRules from '../data/harmRules.js';
// 导入统一的常量
import { CHAR_ORDER_MAP } from './constants.js';

function getNormalizedKey(chars) {
    return chars.sort((a, b) => (CHAR_ORDER_MAP.get(a) || 0) - (CHAR_ORDER_MAP.get(b) || 0)).join('');
}


function parseIndex(id) {
    let outer = null, inner = null;
    if (id.startsWith('dy')) {
        const match = id.match(/^dy(\d+)/);
        if (match) outer = parseInt(match[1], 10);
    } else if (id.startsWith('ln')) {
        const match = id.match(/^ln(\d+)_(\d+)/);
        if (match) { outer = parseInt(match[1], 10); inner = parseInt(match[2], 10); }
    } else if (id.startsWith('xy')) {
        const match = id.match(/^xy(\d+)_(\d+)/);
        if (match) { outer = parseInt(match[1], 10); inner = parseInt(match[2], 10); }
    }
    return { outer, inner };
}

function classifyIds(ids) {
  const classified = { B: [], D: [], L: [], X: [] };
  if (!ids || ids.length === 0) return classified;
  for (const id of ids) {
    if (id.startsWith('dy')) classified.D.push(id);
    else if (id.startsWith('ln')) classified.L.push(id);
    else if (id.startsWith('xy')) classified.X.push(id);
    else classified.B.push(id);
  }
  return classified;
}

/**
 * MODIFIED: 全面升级组合生成与过滤逻辑
 * @param {Array<Array<string>>} idLists - 包含多个ID列表的数组
 * @returns {Array<Array<string>>} 所有有效的、经过排序的ID组合
 */
function generateCombinations(idLists) {
    if (idLists.some(list => list.length === 0)) return [];

    let combinations;

    // 1. 根据idLists的数量决定组合方式
    // 如果只有一个列表，说明是自刑，需要从内部生成两两组合
    if (idLists.length === 1) {
        const arr = idLists[0].flat();
        combinations = [];
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                combinations.push([arr[i], arr[j]]);
            }
        }
    } else if (idLists.length > 1) { // 如果有多个列表，则使用笛卡尔积生成组合
        const cartesian = (...arrays) => arrays.reduce((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]]);
        combinations = cartesian(...idLists.map(list => list.flat()));
    } else {
        return [];
    }

    // 2. 对所有生成的组合应用一套严格的过滤规则
    return combinations.filter(combo => {
        // 规则A: 检查时间对应关系
        const hasD = combo.some(id => id.startsWith('dy'));
        const hasL = combo.some(id => id.startsWith('ln'));
        const hasX = combo.some(id => id.startsWith('xy'));
        
        if (hasD && hasL) {
            const dId = combo.find(id => id.startsWith('dy'));
            const lId = combo.find(id => id.startsWith('ln'));
            if (parseIndex(dId).outer !== parseIndex(lId).outer) return false;
        }
        if (hasL && hasX) {
            const lId = combo.find(id => id.startsWith('ln'));
            const xId = combo.find(id => id.startsWith('xy'));
            const lParsed = parseIndex(lId);
            const xParsed = parseIndex(xId);
            if (lParsed.outer !== 0 || lParsed.inner !== xParsed.inner) return false;
        }
        
        // 规则B: 过滤无效的同类型组合
        const types = combo.map(id => {
            if (id.startsWith('dy')) return 'D';
            if (id.startsWith('ln')) return 'L';
            if (id.startsWith('xy')) return 'X';
            return 'B';
        });

        if (combo.length === 2) {
            if (types[0] === 'D' && types[1] === 'D') return false; // 过滤 DD
            if (types[0] === 'L' && types[1] === 'L') return false; // 过滤 LL
            if (types[0] === 'X' && types[1] === 'X') return false; // 过滤 XX
            if ((types[0] === 'D' && types[1] === 'X') || (types[0] === 'X' && types[1] === 'D')) return false; // 过滤 DX
        }
        
        if (combo.length === 3) {
            const dCount = types.filter(t => t === 'D').length;
            const lCount = types.filter(t => t === 'L').length;
            const xCount = types.filter(t => t === 'X').length;
            if (dCount > 1 || lCount > 1 || xCount > 1) return false; // 过滤 DDD, LLL, XXX, DDL 等
            if (dCount > 0 && xCount > 0) return false; // 过滤 D...X... 组合
        }

        return true; // 只有通过所有检查的组合才会被保留
    }).map(combo => combo.sort());
}


function calculateHarmRelations(context) {
    const relations = [];
    const { baziIndex } = context;

    if (!baziIndex) {
        console.error("[harmCalculator] Error: baziIndex not found in context.");
        return [];
    }
    
    // MODIFIED: 采用新的、更健壮的算法
    const charsInChart = Object.keys(baziIndex);

    // 处理二维关系
    for (let i = 0; i < charsInChart.length; i++) {
        for (let j = i; j < charsInChart.length; j++) {
            const char1 = charsInChart[i];
            const char2 = charsInChart[j];

            const ruleKey = getNormalizedKey([char1, char2]);
            const ruleInfo = (harmRules.tiangan && harmRules.tiangan[ruleKey]) || 
                             (harmRules.dizhi_2_char && harmRules.dizhi_2_char[ruleKey]) ||
                             (harmRules.dizhi_self && harmRules.dizhi_self[ruleKey]);
            
            if (ruleInfo) {
                const ids1 = classifyIds(baziIndex[char1]);
                // MODIFIED: 统一将分类后的ID列表传递给generateCombinations
                const idLists = char1 === char2
                    ? [[...ids1.B, ...ids1.D, ...ids1.L, ...ids1.X]] // 自刑时传一个列表
                    : [[...ids1.B, ...ids1.D, ...ids1.L, ...ids1.X], [...classifyIds(baziIndex[char2]).B, ...classifyIds(baziIndex[char2]).D, ...classifyIds(baziIndex[char2]).L, ...classifyIds(baziIndex[char2]).X]]; // 非自刑传两个
                
                const combinations = generateCombinations(idLists);

                for (const combo of combinations) {
                    ruleInfo.type.forEach(relationType => {
                        // 修改点1：支持result_map
                        let result = null;
                        if (ruleInfo.result_map && ruleInfo.result_map[relationType]) {
                            // 如果有特定类型的结果映射，优先使用
                            result = ruleInfo.result_map[relationType];
                        } else {
                            // 否则使用通用result值，若没有则为null
                            result = ruleInfo.result || null;
                        }
                        
                        relations.push({ type: relationType, elements: combo, result: result });
                    });
                }
            }
        }
    }

    // 处理三维关系
    for (let i = 0; i < charsInChart.length; i++) {
        for (let j = i + 1; j < charsInChart.length; j++) {
            for (let k = j + 1; k < charsInChart.length; k++) {
                const char1 = charsInChart[i];
                const char2 = charsInChart[j];
                const char3 = charsInChart[k];

                const ruleKey = getNormalizedKey([char1, char2, char3]);
                const ruleInfo = harmRules.dizhi_3_char && harmRules.dizhi_3_char[ruleKey];

                if (ruleInfo) {
                    const ids1 = classifyIds(baziIndex[char1]);
                    const ids2 = classifyIds(baziIndex[char2]);
                    const ids3 = classifyIds(baziIndex[char3]);
                    const idLists = [
                        [...ids1.B, ...ids1.D, ...ids1.L, ...ids1.X],
                        [...ids2.B, ...ids2.D, ...ids2.L, ...ids2.X],
                        [...ids3.B, ...ids3.D, ...ids3.L, ...ids3.X]
                    ];
                    const combinations = generateCombinations(idLists);

                    for (const combo of combinations) {
                        ruleInfo.type.forEach(relationType => {
                            // 修改点2：支持result_map (三维关系)
                            let result = null;
                            if (ruleInfo.result_map && ruleInfo.result_map[relationType]) {
                                // 如果有特定类型的结果映射，优先使用
                                result = ruleInfo.result_map[relationType];
                            } else {
                                // 否则使用通用result值，若没有则为null
                                result = ruleInfo.result || null;
                            }
                            
                            relations.push({ type: relationType, elements: combo, result: result });
                        });
                    }
                }
            }
        }
    }

    // 使用您提出的更高效的去重方案
    const seen = new Map();
    const uniqueRelations = [];
    for (const relation of relations) {
        const signature = `${relation.type}|${relation.elements.join(',')}|${relation.result || ''}`;
        if (!seen.has(signature)) {
            seen.set(signature, true);
            uniqueRelations.push(relation);
        }
    }

    console.log(`[harmCalculator] Found ${uniqueRelations.length} relations.`);
    return uniqueRelations;
}

export { calculateHarmRelations };