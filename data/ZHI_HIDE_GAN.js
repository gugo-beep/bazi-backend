/**
 * 地支藏干对照表
 * 每个地支包含1-3个藏干，分别对应本气、中气、余气
 */
const ZHI_HIDE_GAN = {
    "子": [{ gan: "癸", type: "本气"}],
    "丑": [{ gan: "己", type: "本气"},{ gan: "癸", type: "中气"}, { gan: "辛", type: "余气"}],
    "寅": [{ gan: "甲", type: "本气"},{ gan: "丙", type: "中气"}, { gan: "戊", type: "余气"}],
    "卯": [{ gan: "乙", type: "本气"}],
    "辰": [{ gan: "戊", type: "本气"},{ gan: "乙", type: "中气"}, { gan: "癸", type: "余气"}],
    "巳": [{ gan: "丙", type: "本气"},{ gan: "庚", type: "中气"}, { gan: "戊", type: "余气"}],
    "午": [{ gan: "丁", type: "本气"},{ gan: "己", type: "中气"}],
    "未": [{ gan: "己", type: "本气"},{ gan: "丁", type: "中气"}, { gan: "乙", type: "余气"}],
    "申": [{ gan: "庚", type: "本气"},{ gan: "壬", type: "中气"}, { gan: "戊", type: "余气"}],
    "酉": [{ gan: "辛", type: "本气"}],
    "戌": [{ gan: "戊", type: "本气"},{ gan: "辛", type: "中气"}, { gan: "丁", type: "余气"}],
    "亥": [{ gan: "壬", type: "本气"},{ gan: "甲", type: "中气"}]
};

export default ZHI_HIDE_GAN;