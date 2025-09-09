// /data/shenshaRules.js

/**
 * 神煞计算规则模块
 * * 严格遵循"前提 -> 触发 -> 判断 -> 标记"的统一逻辑。
 * * 每一个规则对象都拥有完全相同的结构，以实现解析逻辑的绝对统一。
 */
const shenshaRules = [
    {
        name: '元辰',
        comment: '元辰的规则根据性别和日干阴阳分为两支，其触发判断逻辑完全不同。',
        
        // 使用 branches 结构，因为两套 rules 完全不同
        branches: [
            {
                // 分支一：适用于"阳男"或"阴女"
                // 注意 preconditions 的结构，它本身就是一个"或"逻辑
                preconditions: {
                    logic: 'or',
                    groups: [
                        // 条件组A: 阳男
                        [
                            { on: ['gender'], value: ['男'] },
                            { on: ['dayGan'], value: ['甲', '丙', '戊', '庚', '壬'] }
                        ],
                        // 条件组B: 阴女
                        [
                            { on: ['gender'], value: ['女'] },
                            { on: ['dayGan'], value: ['乙', '丁', '己', '辛', '癸'] }
                        ]
                    ]
                },
                // 这套 rules 适用于上面两个条件组中的任何一个
                rules: [
                    { trigger: { on: ['yearZhi'], value: ['子'] }, judgment: { on: ['allZhi'], value: ['未'] } },
                    { trigger: { on: ['yearZhi'], value: ['丑'] }, judgment: { on: ['allZhi'], value: ['申'] } },
                    { trigger: { on: ['yearZhi'], value: ['寅'] }, judgment: { on: ['allZhi'], value: ['酉'] } },
                    { trigger: { on: ['yearZhi'], value: ['卯'] }, judgment: { on: ['allZhi'], value: ['戌'] } },
                    { trigger: { on: ['yearZhi'], value: ['辰'] }, judgment: { on: ['allZhi'], value: ['亥'] } },
                    { trigger: { on: ['yearZhi'], value: ['巳'] }, judgment: { on: ['allZhi'], value: ['子'] } },
                    { trigger: { on: ['yearZhi'], value: ['午'] }, judgment: { on: ['allZhi'], value: ['丑'] } },
                    { trigger: { on: ['yearZhi'], value: ['未'] }, judgment: { on: ['allZhi'], value: ['寅'] } },
                    { trigger: { on: ['yearZhi'], value: ['申'] }, judgment: { on: ['allZhi'], value: ['卯'] } },
                    { trigger: { on: ['yearZhi'], value: ['酉'] }, judgment: { on: ['allZhi'], value: ['辰'] } },
                    { trigger: { on: ['yearZhi'], value: ['戌'] }, judgment: { on: ['allZhi'], value: ['巳'] } },
                    { trigger: { on: ['yearZhi'], value: ['亥'] }, judgment: { on: ['allZhi'], value: ['午'] } }
                ]
            },
            {
                // 分支二：适用于"阴男"或"阳女"
                preconditions: {
                    logic: 'or',
                    groups: [
                        // 条件组C: 阴男
                        [
                            { on: ['gender'], value: ['男'] },
                            { on: ['dayGan'], value: ['乙', '丁', '己', '辛', '癸'] }
                        ],
                        // 条件组D: 阳女
                        [
                            { on: ['gender'], value: ['女'] },
                            { on: ['dayGan'], value: ['甲', '丙', '戊', '庚', '壬'] }
                        ]
                    ]
                },
                // 这套 rules 适用于上面两个条件组中的任何一个
                rules: [
                    { trigger: { on: ['yearZhi'], value: ['子'] }, judgment: { on: ['allZhi'], value: ['巳'] } },
                    { trigger: { on: ['yearZhi'], value: ['丑'] }, judgment: { on: ['allZhi'], value: ['午'] } },
                    { trigger: { on: ['yearZhi'], value: ['寅'] }, judgment: { on: ['allZhi'], value: ['未'] } },
                    { trigger: { on: ['yearZhi'], value: ['卯'] }, judgment: { on: ['allZhi'], value: ['申'] } },
                    { trigger: { on: ['yearZhi'], value: ['辰'] }, judgment: { on: ['allZhi'], value: ['酉'] } },
                    { trigger: { on: ['yearZhi'], value: ['巳'] }, judgment: { on: ['allZhi'], value: ['戌'] } },
                    { trigger: { on: ['yearZhi'], value: ['午'] }, judgment: { on: ['allZhi'], value: ['亥'] } },
                    { trigger: { on: ['yearZhi'], value: ['未'] }, judgment: { on: ['allZhi'], value: ['子'] } },
                    { trigger: { on: ['yearZhi'], value: ['申'] }, judgment: { on: ['allZhi'], value: ['丑'] } },
                    { trigger: { on: ['yearZhi'], value: ['酉'] }, judgment: { on: ['allZhi'], value: ['寅'] } },
                    { trigger: { on: ['yearZhi'], value: ['戌'] }, judgment: { on: ['allZhi'], value: ['卯'] } },
                    { trigger: { on: ['yearZhi'], value: ['亥'] }, judgment: { on: ['allZhi'], value: ['辰'] } }
                ]
            }
        ]
    },
    {
        name: '勾煞',
        comment: '勾煞',
        branches: [
            {
                preconditions: {
                    logic: 'or',
                    groups: [
                        [
                            { on: ['gender'], value: ['男']},
                            { on: ['dayGan'], value: ['甲', '丙', '戊', '庚', '壬'] }
                        ],
                        [
                            { on: ['gender'], value: ['女']},
                            { on: ['dayGan'], value: ['乙', '丁', '己', '辛', '癸'] }
                        ]
                    ]
                },
                rules: [
                    { trigger: { on: ['yearZhi'], value: ['子'] }, judgment: { on: ['allZhi'], value: ['卯'] } },
                    { trigger: { on: ['yearZhi'], value: ['丑'] }, judgment: { on: ['allZhi'], value: ['辰'] } },
                    { trigger: { on: ['yearZhi'], value: ['寅'] }, judgment: { on: ['allZhi'], value: ['巳'] } },
                    { trigger: { on: ['yearZhi'], value: ['卯'] }, judgment: { on: ['allZhi'], value: ['午'] } },
                    { trigger: { on: ['yearZhi'], value: ['辰'] }, judgment: { on: ['allZhi'], value: ['未'] } },
                    { trigger: { on: ['yearZhi'], value: ['巳'] }, judgment: { on: ['allZhi'], value: ['申'] } },
                    { trigger: { on: ['yearZhi'], value: ['午'] }, judgment: { on: ['allZhi'], value: ['酉'] } },
                    { trigger: { on: ['yearZhi'], value: ['未'] }, judgment: { on: ['allZhi'], value: ['戌'] } },
                    { trigger: { on: ['yearZhi'], value: ['申'] }, judgment: { on: ['allZhi'], value: ['亥'] } },
                    { trigger: { on: ['yearZhi'], value: ['酉'] }, judgment: { on: ['allZhi'], value: ['子'] } },
                    { trigger: { on: ['yearZhi'], value: ['戌'] }, judgment: { on: ['allZhi'], value: ['丑'] } },
                    { trigger: { on: ['yearZhi'], value: ['亥'] }, judgment: { on: ['allZhi'], value: ['寅'] } }
                ]
            },
            {
                preconditions: {
                    logic: 'or',
                    groups: [
                        [
                            { on: ['gender'], value: ['男'] },
                            { on: ['dayGan'], value: ['乙', '丁', '己', '辛', '癸'] }
                        ],
                        [
                            { on: ['gender'], value: ['女'] },
                            { on: ['dayGan'], value: ['甲', '丙', '戊', '庚', '壬'] }
                        ]
                    ]
                },
                rules: [
                    { trigger: { on: ['yearZhi'], value: ['子'] }, judgment: { on: ['allZhi'], value: ['酉'] } },
                    { trigger: { on: ['yearZhi'], value: ['丑'] }, judgment: { on: ['allZhi'], value: ['戌'] } },
                    { trigger: { on: ['yearZhi'], value: ['寅'] }, judgment: { on: ['allZhi'], value: ['亥'] } },
                    { trigger: { on: ['yearZhi'], value: ['卯'] }, judgment: { on: ['allZhi'], value: ['子'] } },
                    { trigger: { on: ['yearZhi'], value: ['辰'] }, judgment: { on: ['allZhi'], value: ['丑'] } },
                    { trigger: { on: ['yearZhi'], value: ['巳'] }, judgment: { on: ['allZhi'], value: ['寅'] } },
                    { trigger: { on: ['yearZhi'], value: ['午'] }, judgment: { on: ['allZhi'], value: ['卯'] } },
                    { trigger: { on: ['yearZhi'], value: ['未'] }, judgment: { on: ['allZhi'], value: ['辰'] } },
                    { trigger: { on: ['yearZhi'], value: ['申'] }, judgment: { on: ['allZhi'], value: ['巳'] } },
                    { trigger: { on: ['yearZhi'], value: ['酉'] }, judgment: { on: ['allZhi'], value: ['午'] } },
                    { trigger: { on: ['yearZhi'], value: ['戌'] }, judgment: { on: ['allZhi'], value: ['未'] } },
                    { trigger: { on: ['yearZhi'], value: ['亥'] }, judgment: { on: ['allZhi'], value: ['申'] } }
                ]
            }
        ]
    },
    {
        name: '绞煞',
        comment: '绞煞',
        branches: [
            {
                preconditions: {
                    logic: 'or',
                    groups: [
                        [
                            { on: ['gender'], value: ['女']},
                            { on: ['dayGan'], value: ['甲', '丙', '戊', '庚', '壬'] }
                        ],
                        [
                            { on: ['gender'], value: ['男']},
                            { on: ['dayGan'], value: ['乙', '丁', '己', '辛', '癸'] }
                        ]
                    ]
                },
                rules: [
                    { trigger: { on: ['yearZhi'], value: ['子'] }, judgment: { on: ['allZhi'], value: ['卯'] } },
                    { trigger: { on: ['yearZhi'], value: ['丑'] }, judgment: { on: ['allZhi'], value: ['辰'] } },
                    { trigger: { on: ['yearZhi'], value: ['寅'] }, judgment: { on: ['allZhi'], value: ['巳'] } },
                    { trigger: { on: ['yearZhi'], value: ['卯'] }, judgment: { on: ['allZhi'], value: ['午'] } },
                    { trigger: { on: ['yearZhi'], value: ['辰'] }, judgment: { on: ['allZhi'], value: ['未'] } },
                    { trigger: { on: ['yearZhi'], value: ['巳'] }, judgment: { on: ['allZhi'], value: ['申'] } },
                    { trigger: { on: ['yearZhi'], value: ['午'] }, judgment: { on: ['allZhi'], value: ['酉'] } },
                    { trigger: { on: ['yearZhi'], value: ['未'] }, judgment: { on: ['allZhi'], value: ['戌'] } },
                    { trigger: { on: ['yearZhi'], value: ['申'] }, judgment: { on: ['allZhi'], value: ['亥'] } },
                    { trigger: { on: ['yearZhi'], value: ['酉'] }, judgment: { on: ['allZhi'], value: ['子'] } },
                    { trigger: { on: ['yearZhi'], value: ['戌'] }, judgment: { on: ['allZhi'], value: ['丑'] } },
                    { trigger: { on: ['yearZhi'], value: ['亥'] }, judgment: { on: ['allZhi'], value: ['寅'] } }
                ]
            },
            {
                preconditions: {
                    logic: 'or',
                    groups: [
                        [
                            { on: ['gender'], value: ['女']},
                            { on: ['dayGan'], value: ['乙', '丁', '己', '辛', '癸'] }
                        ],
                        [
                            { on: ['gender'], value: ['男']},
                            { on: ['dayGan'], value: ['甲', '丙', '戊', '庚', '壬'] }
                        ]
                    ]
                },
                rules: [
                    { trigger: { on: ['yearZhi'], value: ['子'] }, judgment: { on: ['allZhi'], value: ['酉'] } },
                    { trigger: { on: ['yearZhi'], value: ['丑'] }, judgment: { on: ['allZhi'], value: ['戌'] } },
                    { trigger: { on: ['yearZhi'], value: ['寅'] }, judgment: { on: ['allZhi'], value: ['亥'] } },
                    { trigger: { on: ['yearZhi'], value: ['卯'] }, judgment: { on: ['allZhi'], value: ['子'] } },
                    { trigger: { on: ['yearZhi'], value: ['辰'] }, judgment: { on: ['allZhi'], value: ['丑'] } },
                    { trigger: { on: ['yearZhi'], value: ['巳'] }, judgment: { on: ['allZhi'], value: ['寅'] } },
                    { trigger: { on: ['yearZhi'], value: ['午'] }, judgment: { on: ['allZhi'], value: ['卯'] } },
                    { trigger: { on: ['yearZhi'], value: ['未'] }, judgment: { on: ['allZhi'], value: ['辰'] } },
                    { trigger: { on: ['yearZhi'], value: ['申'] }, judgment: { on: ['allZhi'], value: ['巳'] } },
                    { trigger: { on: ['yearZhi'], value: ['酉'] }, judgment: { on: ['allZhi'], value: ['午'] } },
                    { trigger: { on: ['yearZhi'], value: ['戌'] }, judgment: { on: ['allZhi'], value: ['未'] } },
                    { trigger: { on: ['yearZhi'], value: ['亥'] }, judgment: { on: ['allZhi'], value: ['申'] } }
                ]
            }
        ]
    },
    {
        name: '天转煞',
          comment: '天转煞',
          preconditions: [],
        // 每一个独立的逻辑判断，都是rules数组中的一个元素
          rules: [
            {
                // 触发条件：月支在寅、卯、辰（春天）
                trigger: {  on: ['monthZhi'],  value: ['寅', '卯', '辰']},
                // 判断条件：日柱是"乙卯"
                judgment: {  on: ['dayPillar'],  value: ['乙卯']}
            },
            {
                // 触发条件：月支在巳、午、未（夏天）
                trigger: {  on: ['monthZhi'],  value: ['巳', '午', '未']},
                // 判断条件：日柱是"丙午"
                judgment: {  on: ['dayPillar'],  value: ['丙午'] }
            },
            {
                // 触发条件：月支在申、酉、戌（秋天）
                trigger: {  on: ['monthZhi'],  value: ['申', '酉', '戌']},
                // 判断条件：d日柱是"辛酉"
                judgment: {  on: ['dayPillar'],  value: ['辛酉'] }
            },
            {
                // 触发条件：月支在亥、子、丑（冬天）
                trigger: {  on: ['monthZhi'],  value: ['亥', '子', '丑']},
                // 判断条件：日柱是"壬子"
                judgment: {  on: ['dayPillar'],  value: ['壬子'] }
            }
        ]
    },
    {
        name: '地转煞',
        comment: '地转煞',
        preconditions: [],
        rules: [
          { trigger:{ on:['monthZhi'], value:['寅','卯','辰']}, judgment:{ on:['dayPillar'], value:['辛卯']}},
          { trigger:{ on:['monthZhi'], value:['巳','午','未']}, judgment:{ on:['dayPillar'], value:['戊午']}},
          { trigger:{ on:['monthZhi'], value:['申','酉','戌']}, judgment:{ on:['dayPillar'], value:['癸酉']}},
          { trigger:{ on:['monthZhi'], value:['亥','子','丑']}, judgment:{ on:['dayPillar'], value:['丙子']}}
      ]
    },
    {
        name: '纳音童子',
        comment: '纳音童子',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearNaYin'], value:['海中金','剑锋金','白蜡金','沙中金','金箔金','钗钏金','大林木','杨柳木','松柏木','平地木','桑柘木','石榴木']}, judgment:{ on:['dayZhi','hourZhi'], value:['午','卯']}},
          { trigger:{ on:['yearNaYin'], value:['涧下水','泉中水','长流水','天河水','大溪水','大海水','炉中火','山头火','霹雳火','山下火','覆灯火','天上火']}, judgment:{ on:['dayZhi','hourZhi'], value:['酉','戌']}},
          { trigger:{ on:['yearNaYin'], value:['路旁土','城头土','屋上土','壁上土','大驿土','沙中土']}, judgment:{ on:['dayZhi','hourZhi'], value:['辰','巳']}}
      ]
    },
    {
        name: '支童子',
        comment: '支童子',
        preconditions: [],
        rules: [
          { trigger:{ on:['monthZhi'], value:['寅','卯','辰','申','酉','戌']}, judgment:{ on:['dayZhi','hourZhi'], value:['寅','子']}},
          { trigger:{ on:['monthZhi'], value:['巳','午','未','亥','子','丑']}, judgment:{ on:['dayZhi','hourZhi'], value:['卯','未','辰']}}
      ]
    },
    {
        name: '天乙贵人',
        comment: '天乙贵人',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearGan'], value:['戊','甲','庚']}, judgment:{ on:['allZhi'], value:['丑','未']}},
          { trigger:{ on:['yearGan'], value:['乙','己']}, judgment:{ on:['allZhi'], value:['子','申']}},
          { trigger:{ on:['yearGan'], value:['丙','丁']}, judgment:{ on:['allZhi'], value:['亥','酉']}},
          { trigger:{ on:['yearGan'], value:['辛']}, judgment:{ on:['allZhi'], value:['午','寅']}},
          { trigger:{ on:['yearGan'], value:['壬','癸']}, judgment:{ on:['allZhi'], value:['巳','卯']}}
      ]
    },
    {
        name: '太极贵人',
        comment: '太极贵人',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayGan'], value:['甲','乙']}, judgment:{ on:['allZhi'], value:['子','午']}},
          { trigger:{ on:['dayGan'], value:['丙','丁']}, judgment:{ on:['allZhi'], value:['酉','卯']}},
          { trigger:{ on:['dayGan'], value:['戊','己']}, judgment:{ on:['allZhi'], value:['辰','戌','丑','未']}},
          { trigger:{ on:['dayGan'], value:['庚','辛']}, judgment:{ on:['allZhi'], value:['寅','亥']}},
          { trigger:{ on:['dayGan'], value:['壬','癸']}, judgment:{ on:['allZhi'], value:['巳','申']}}
      ]
    },
    {
        name: '天德贵人',
        comment: '天德贵人',
        preconditions: [],
        rules: [
          { trigger:{ on:['monthZhi'], value:['寅']}, judgment:{ on:'allGan', value:['丁']}},
          { trigger:{ on:['monthZhi'], value:['卯']}, judgment:{ on:'allGan', value:['申']}},
          { trigger:{ on:['monthZhi'], value:['辰']}, judgment:{ on:'allGan', value:['壬']}},
          { trigger:{ on:['monthZhi'], value:['巳']}, judgment:{ on:'allGan', value:['辛']}},
          { trigger:{ on:['monthZhi'], value:['午']}, judgment:{ on:'allGan', value:['亥']}},
          { trigger:{ on:['monthZhi'], value:['未']}, judgment:{ on:'allGan', value:['甲']}},
          { trigger:{ on:['monthZhi'], value:['申']}, judgment:{ on:'allGan', value:['癸']}},
          { trigger:{ on:['monthZhi'], value:['酉']}, judgment:{ on:'allGan', value:['寅']}},
          { trigger:{ on:['monthZhi'], value:['戌']}, judgment:{ on:'allGan', value:['丙']}},
          { trigger:{ on:['monthZhi'], value:['亥']}, judgment:{ on:'allGan', value:['乙']}},
          { trigger:{ on:['monthZhi'], value:['子']}, judgment:{ on:'allGan', value:['巳']}},
          { trigger:{ on:['monthZhi'], value:['丑']}, judgment:{ on:'allGan', value:['庚']}}
      ]
    },
    {
        name: '月德贵人',
        comment: '月德贵人',
        preconditions: [],
        rules: [
          { trigger:{ on:['monthZhi'], value:['寅','午','戌']}, judgment:{ on:'allGan', value:['丙']}},
          { trigger:{ on:['monthZhi'], value:['申','子','辰']}, judgment:{ on:'allGan', value:['壬']}},
          { trigger:{ on:['monthZhi'], value:['亥','卯','未']}, judgment:{ on:'allGan', value:['甲']}},
          { trigger:{ on:['monthZhi'], value:['巳','酉','丑']}, judgment:{ on:'allGan', value:['庚']}}
      ]
    },
    {
        name: '德贵人',
        comment: '德贵人',
        preconditions: [],
        rules: [
          { trigger:{ on:['monthZhi'], value:['寅','午','戌']}, judgment:{ on:'allGan', value:['丙','丁']}},
          { trigger:{ on:['monthZhi'], value:['申','子','辰']}, judgment:{ on:'allGan', value:['壬','癸','戊','己']}},
          { trigger:{ on:['monthZhi'], value:['巳','酉','丑']}, judgment:{ on:'allGan', value:['庚','辛']}},
          { trigger:{ on:['monthZhi'], value:['亥','卯','未']}, judgment:{ on:'allGan', value:['甲','乙']}}
      ]
    },
    {
        name: '秀贵人',
        comment: '秀贵人',
        preconditions: [],
        rules: [
          { trigger:{ on:['monthZhi'], value:['寅','午','戌']}, judgment:{ on:'allGan', value:['戊','癸']}},
          { trigger:{ on:['monthZhi'], value:['申','子','辰']}, judgment:{ on:'allGan', value:['丙','辛','甲','己']}},
          { trigger:{ on:['monthZhi'], value:['巳','酉','丑']}, judgment:{ on:'allGan', value:['庚','乙']}},
          { trigger:{ on:['monthZhi'], value:['亥','卯','未']}, judgment:{ on:'allGan', value:['丁','壬']}}
      ]
    },
    {
        name: '福星贵人',
        comment: '福星贵人',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayGan','yearGan'], value:['甲','丙']}, judgment:{ on:['allZhi'], value:['寅','子']}},
          { trigger:{ on:['dayGan','yearGan'], value:['乙','癸']}, judgment:{ on:['allZhi'], value:['卯','丑']}},
          { trigger:{ on:['dayGan','yearGan'], value:['戊']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['dayGan','yearGan'], value:['己']}, judgment:{ on:['allZhi'], value:['未']}},
          { trigger:{ on:['dayGan','yearGan'], value:['丁']}, judgment:{ on:['allZhi'], value:['亥']}},
          { trigger:{ on:['dayGan','yearGan'], value:['庚']}, judgment:{ on:['allZhi'], value:['午']}},
          { trigger:{ on:['dayGan','yearGan'], value:['辛']}, judgment:{ on:['allZhi'], value:['巳']}},
          { trigger:{ on:['dayGan','yearGan'], value:['壬']}, judgment:{ on:['allZhi'], value:['辰']}}
      ]
    },
    {
        name: '拱禄',
        comment: '拱禄',
        preconditions: [],
        rules: [
          { trigger:{ on:['hourPillar'], value:['癸丑']}, judgment:{ on:['dayPillar'], value:['癸亥']}},
          { trigger:{ on:['hourPillar'], value:['癸亥']}, judgment:{ on:['dayPillar'], value:['癸丑']}},
          { trigger:{ on:['hourPillar'], value:['丁未']}, judgment:{ on:['dayPillar'], value:['丁巳']}},
          { trigger:{ on:['hourPillar'], value:['己巳']}, judgment:{ on:['dayPillar'], value:['己未']}},
          { trigger:{ on:['hourPillar'], value:['戊午']}, judgment:{ on:['dayPillar'], value:['戊辰']}}
      ]
    },
    {
        name: '金舆',
        comment: '金舆',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayGan'], value:['甲']}, judgment:{ on:['allZhi'], value:['辰']}},
          { trigger:{ on:['dayGan'], value:['乙']}, judgment:{ on:['allZhi'], value:['巳']}},
          { trigger:{ on:['dayGan'], value:['丙']}, judgment:{ on:['allZhi'], value:['未']}},
          { trigger:{ on:['dayGan'], value:['丁']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['dayGan'], value:['戊']}, judgment:{ on:['allZhi'], value:['未']}},
          { trigger:{ on:['dayGan'], value:['己']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['dayGan'], value:['庚']}, judgment:{ on:['allZhi'], value:['戌']}},
          { trigger:{ on:['dayGan'], value:['辛']}, judgment:{ on:['allZhi'], value:['亥']}},
          { trigger:{ on:['dayGan'], value:['壬']}, judgment:{ on:['allZhi'], value:['丑']}},
          { trigger:{ on:['dayGan'], value:['癸']}, judgment:{ on:['allZhi'], value:['寅']}}
      ]
    },
    {
        name: '天医',
        comment: '天医',
        preconditions: [],
        rules: [
          { trigger:{ on:['monthZhi'], value:['寅']}, judgment:{ on:['allZhi'], value:['丑']}},
          { trigger:{ on:['monthZhi'], value:['卯']}, judgment:{ on:['allZhi'], value:['寅']}},
          { trigger:{ on:['monthZhi'], value:['辰']}, judgment:{ on:['allZhi'], value:['卯']}},
          { trigger:{ on:['monthZhi'], value:['巳']}, judgment:{ on:['allZhi'], value:['辰']}},
          { trigger:{ on:['monthZhi'], value:['午']}, judgment:{ on:['allZhi'], value:['巳']}},
          { trigger:{ on:['monthZhi'], value:['未']}, judgment:{ on:['allZhi'], value:['午']}},
          { trigger:{ on:['monthZhi'], value:['申']}, judgment:{ on:['allZhi'], value:['未']}},
          { trigger:{ on:['monthZhi'], value:['酉']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['monthZhi'], value:['戌']}, judgment:{ on:['allZhi'], value:['酉']}},
          { trigger:{ on:['monthZhi'], value:['亥']}, judgment:{ on:['allZhi'], value:['戌']}},
          { trigger:{ on:['monthZhi'], value:['子']}, judgment:{ on:['allZhi'], value:['亥']}},
          { trigger:{ on:['monthZhi'], value:['丑']}, judgment:{ on:['allZhi'], value:['子']}}
      ]
    },
    {
        name: '文昌贵人',
        comment: '文昌贵人',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearGan','dayGan'], value:['甲']}, judgment:{ on:['allZhi'], value:['巳']}},
          { trigger:{ on:['yearGan','dayGan'], value:['乙']}, judgment:{ on:['allZhi'], value:['午']}},
          { trigger:{ on:['yearGan','dayGan'], value:['丙']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['yearGan','dayGan'], value:['丁']}, judgment:{ on:['allZhi'], value:['酉']}},
          { trigger:{ on:['yearGan','dayGan'], value:['戊']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['yearGan','dayGan'], value:['己']}, judgment:{ on:['allZhi'], value:['酉']}},
          { trigger:{ on:['yearGan','dayGan'], value:['庚']}, judgment:{ on:['allZhi'], value:['亥']}},
          { trigger:{ on:['yearGan','dayGan'], value:['辛']}, judgment:{ on:['allZhi'], value:['子']}},
          { trigger:{ on:['yearGan','dayGan'], value:['壬']}, judgment:{ on:['allZhi'], value:['寅']}},
          { trigger:{ on:['yearGan','dayGan'], value:['癸']}, judgment:{ on:['allZhi'], value:['卯']}}
      ]
    },
    {
        name: '国印贵人',
        comment: '国印贵人',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearGan','dayGan'], value:['甲']}, judgment:{ on:['allZhi'], value:['戌']}},
          { trigger:{ on:['yearGan','dayGan'], value:['乙']}, judgment:{ on:['allZhi'], value:['亥']}},
          { trigger:{ on:['yearGan','dayGan'], value:['丙']}, judgment:{ on:['allZhi'], value:['丑']}},
          { trigger:{ on:['yearGan','dayGan'], value:['丁']}, judgment:{ on:['allZhi'], value:['寅']}},
          { trigger:{ on:['yearGan','dayGan'], value:['戊']}, judgment:{ on:['allZhi'], value:['丑']}},
          { trigger:{ on:['yearGan','dayGan'], value:['己']}, judgment:{ on:['allZhi'], value:['寅']}},
          { trigger:{ on:['yearGan','dayGan'], value:['庚']}, judgment:{ on:['allZhi'], value:['辰']}},
          { trigger:{ on:['yearGan','dayGan'], value:['辛']}, judgment:{ on:['allZhi'], value:['巳']}},
          { trigger:{ on:['yearGan','dayGan'], value:['壬']}, judgment:{ on:['allZhi'], value:['未']}},
          { trigger:{ on:['yearGan','dayGan'], value:['癸']}, judgment:{ on:['allZhi'], value:['申']}}
      ]
    },
    {
        name: '驿马',
        comment: '驿马',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearZhi','dayZhi'], value:['申','子','辰']}, judgment:{ on:['allZhi'], value:['寅']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['寅','午','戌']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['巳','酉','丑']}, judgment:{ on:['allZhi'], value:['亥']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['亥','卯','未']}, judgment:{ on:['allZhi'], value:['巳']}}
      ]
    },
    {
        name: '将星',
        comment: '将星',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearZhi','dayZhi'], value:['巳','酉','丑']}, judgment:{ on:['allZhi'], value:['酉'], exclude_trigger: true }},
          { trigger:{ on:['yearZhi','dayZhi'], value:['寅','午','戌']}, judgment:{ on:['allZhi'], value:['午'], exclude_trigger: true }},
          { trigger:{ on:['yearZhi','dayZhi'], value:['亥','卯','未']}, judgment:{ on:['allZhi'], value:['卯'], exclude_trigger: true }},
          { trigger:{ on:['yearZhi','dayZhi'], value:['申','子','辰']}, judgment:{ on:['allZhi'], value:['子'], exclude_trigger: true }}
      ]
    },
    {
        name: '华盖',
        comment: '华盖',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearZhi','dayZhi'], value:['寅','午','戌']}, judgment:{ on:['allZhi'], value:['戌'], exclude_trigger: true }},
          { trigger:{ on:['yearZhi','dayZhi'], value:['亥','卯','未']}, judgment:{ on:['allZhi'], value:['未'], exclude_trigger: true }},
          { trigger:{ on:['yearZhi','dayZhi'], value:['申','子','辰']}, judgment:{ on:['allZhi'], value:['辰'], exclude_trigger: true }},
          { trigger:{ on:['yearZhi','dayZhi'], value:['巳','酉','丑']}, judgment:{ on:['allZhi'], value:['丑'], exclude_trigger: true }}
      ]
    },
    {
        name: '天赦',
        comment: '天赦',
        preconditions: [],
        rules: [
          { trigger:{ on:['monthZhi'], value:['寅','卯','辰']}, judgment:{ on:['dayPillar'], value:['戊寅']}},
          { trigger:{ on:['monthZhi'], value:['巳','午','未']}, judgment:{ on:['dayPillar'], value:['甲午']}},
          { trigger:{ on:['monthZhi'], value:['申','酉','戌']}, judgment:{ on:['dayPillar'], value:['戊申']}},
          { trigger:{ on:['monthZhi'], value:['亥','子','丑']}, judgment:{ on:['dayPillar'], value:['甲子']}}
      ]
    },
    {
        name: '禄神',
        comment: '禄神',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayGan'], value:['甲']}, judgment:{ on:['allZhi'], value:'寅'}},
          { trigger:{ on:['dayGan'], value:['乙']}, judgment:{ on:['allZhi'], value:'卯'}},
          { trigger:{ on:['dayGan'], value:['丙','戊']}, judgment:{ on:['allZhi'], value:['巳']}},
          { trigger:{ on:['dayGan'], value:['丁','己']}, judgment:{ on:['allZhi'], value:['午']}},
          { trigger:{ on:['dayGan'], value:['庚']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['dayGan'], value:['辛']}, judgment:{ on:['allZhi'], value:['酉']}},
          { trigger:{ on:['dayGan'], value:['壬']}, judgment:{ on:['allZhi'], value:['亥']}},
          { trigger:{ on:['dayGan'], value:['癸']}, judgment:{ on:['allZhi'], value:['子']}}
      ]
    },
    {
        name: '羊刃',
        comment: '羊刃',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayGan'], value:['甲']}, judgment:{ on:['allZhi'], value:['卯']}},
          { trigger:{ on:['dayGan'], value:['乙']}, judgment:{ on:['allZhi'], value:['寅']}},
          { trigger:{ on:['dayGan'], value:['丙','戊']}, judgment:{ on:['allZhi'], value:['午']}},
          { trigger:{ on:['dayGan'], value:['丁','己']}, judgment:{ on:['allZhi'], value:['巳']}},
          { trigger:{ on:['dayGan'], value:['庚']}, judgment:{ on:['allZhi'], value:['酉']}},
          { trigger:{ on:['dayGan'], value:['辛']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['dayGan'], value:['壬']}, judgment:{ on:['allZhi'], value:['子']}},
          { trigger:{ on:['dayGan'], value:['癸']}, judgment:{ on:['allZhi'], value:['亥']}}
      ]
    },
    {
        name: '飞刃',
        comment: '飞刃',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayGan'], value:['甲']}, judgment:{ on:['allZhi'], value:['酉']}},
          { trigger:{ on:['dayGan'], value:['乙']}, judgment:{ on:['allZhi'], value:['戌']}},
          { trigger:{ on:['dayGan'], value:['丙']}, judgment:{ on:['allZhi'], value:['子']}},
          { trigger:{ on:['dayGan'], value:['丁']}, judgment:{ on:['allZhi'], value:['丑']}},
          { trigger:{ on:['dayGan'], value:['戊']}, judgment:{ on:['allZhi'], value:['子']}},
          { trigger:{ on:['dayGan'], value:['己']}, judgment:{ on:['allZhi'], value:['丑']}},
          { trigger:{ on:['dayGan'], value:['庚']}, judgment:{ on:['allZhi'], value:['卯']}},
          { trigger:{ on:['dayGan'], value:['辛']}, judgment:{ on:['allZhi'], value:['辰']}},
          { trigger:{ on:['dayGan'], value:['壬']}, judgment:{ on:['allZhi'], value:['午']}},
          { trigger:{ on:['dayGan'], value:['癸']}, judgment:{ on:['allZhi'], value:['未']}}
      ]
    },
    {
        name: '流霞',
        comment: '流霞',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayGan'], value:['甲']}, judgment:{ on:['allZhi'], value:['酉']}},
          { trigger:{ on:['dayGan'], value:['乙']}, judgment:{ on:['allZhi'], value:['戌']}},
          { trigger:{ on:['dayGan'], value:['丙']}, judgment:{ on:['allZhi'], value:['未']}},
          { trigger:{ on:['dayGan'], value:['丁']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['dayGan'], value:['戊']}, judgment:{ on:['allZhi'], value:['巳']}},
          { trigger:{ on:['dayGan'], value:['己']}, judgment:{ on:['allZhi'], value:['午']}},
          { trigger:{ on:['dayGan'], value:['庚']}, judgment:{ on:['allZhi'], value:['辰']}},
          { trigger:{ on:['dayGan'], value:['辛']}, judgment:{ on:['allZhi'], value:['卯']}},
          { trigger:{ on:['dayGan'], value:['壬']}, judgment:{ on:['allZhi'], value:['亥']}},
          { trigger:{ on:['dayGan'], value:['癸']}, judgment:{ on:['allZhi'], value:['寅']}}
      ]
    },
    {
        name: '劫煞',
        comment: '劫煞',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearZhi','dayZhi'], value:['申','子','辰']}, judgment:{ on:['allZhi'], value:['巳']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['亥','卯','未']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['寅','午','戌']}, judgment:{ on:['allZhi'], value:['亥']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['巳','酉','丑']}, judgment:{ on:['allZhi'], value:['寅']}}
      ]
    },
    {
        name: '灾煞',
        comment: '灾煞',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearZhi'], value:['巳','酉','丑']}, judgment:{ on:['allZhi'], value:['卯']}},
          { trigger:{ on:['yearZhi'], value:['寅','午','戌']}, judgment:{ on:['allZhi'], value:['子']}},
          { trigger:{ on:['yearZhi'], value:['亥','卯','未']}, judgment:{ on:['allZhi'], value:['酉']}},
          { trigger:{ on:['yearZhi'], value:['申','子','辰']}, judgment:{ on:['allZhi'], value:['午']}}
      ]
    },
    {
        name: '亡神',
        comment: '亡神',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearZhi','dayZhi'], value:['巳','酉','丑']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['寅','午','戌']}, judgment:{ on:['allZhi'], value:['巳']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['亥','卯','未']}, judgment:{ on:['allZhi'], value:['寅']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['申','子','辰']}, judgment:{ on:['allZhi'], value:['亥']}}
      ]
    },
    {
        name: '咸池',
        comment: '咸池',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearZhi','dayZhi'], value:['巳','酉','丑']}, judgment:{ on:['allZhi'], value:['午']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['寅','午','戌']}, judgment:{ on:['allZhi'], value:['卯']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['亥','卯','未']}, judgment:{ on:['allZhi'], value:['子']}},
          { trigger:{ on:['yearZhi','dayZhi'], value:['申','子','辰']}, judgment:{ on:['allZhi'], value:['酉']}}
      ]
    },
    {
        name: '八专',
        comment: '八专',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayPillar'], value:['甲寅']}, judgment:{ on:['dayPillar'], value:['甲寅']}},
          { trigger:{ on:['dayPillar'], value:['乙卯']}, judgment:{ on:['dayPillar'], value:['乙卯']}},
          { trigger:{ on:['dayPillar'], value:['己未']}, judgment:{ on:['dayPillar'], value:['己未']}},
          { trigger:{ on:['dayPillar'], value:['丁未']}, judgment:{ on:['dayPillar'], value:['丁未']}},
          { trigger:{ on:['dayPillar'], value:['庚申']}, judgment:{ on:['dayPillar'], value:['庚申']}},
          { trigger:{ on:['dayPillar'], value:['辛酉']}, judgment:{ on:['dayPillar'], value:['辛酉']}},
          { trigger:{ on:['dayPillar'], value:['戊戌']}, judgment:{ on:['dayPillar'], value:['戊戌']}},
          { trigger:{ on:['dayPillar'], value:['癸丑']}, judgment:{ on:['dayPillar'], value:['癸丑']}}
      ]
    },
    {
        name: '九丑',
        comment: '九丑',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayPillar'], value:['壬子']}, judgment:{ on:['dayPillar'], value:['壬子']}},
          { trigger:{ on:['dayPillar'], value:['壬午']}, judgment:{ on:['dayPillar'], value:['壬午']}},
          { trigger:{ on:['dayPillar'], value:['戊子']}, judgment:{ on:['dayPillar'], value:['戊子']}},
          { trigger:{ on:['dayPillar'], value:['戊午']}, judgment:{ on:['dayPillar'], value:['戊午']}},
          { trigger:{ on:['dayPillar'], value:['己酉']}, judgment:{ on:['dayPillar'], value:['己酉']}},
          { trigger:{ on:['dayPillar'], value:['己卯']}, judgment:{ on:['dayPillar'], value:['己卯']}},
          { trigger:{ on:['dayPillar'], value:['乙卯']}, judgment:{ on:['dayPillar'], value:['乙卯']}},
          { trigger:{ on:['dayPillar'], value:['辛酉']}, judgment:{ on:['dayPillar'], value:['辛酉']}},
          { trigger:{ on:['dayPillar'], value:['辛卯']}, judgment:{ on:['dayPillar'], value:['辛卯']}}
      ]
    },
    {
        name: '红艳',
        comment: '红艳',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayGan'], value:['甲']}, judgment:{ on:['allZhi'], value:['午']}},
          { trigger:{ on:['dayGan'], value:['乙']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['dayGan'], value:['丙']}, judgment:{ on:['allZhi'], value:['寅']}},
          { trigger:{ on:['dayGan'], value:['丁']}, judgment:{ on:['allZhi'], value:['未']}},
          { trigger:{ on:['dayGan'], value:['戊']}, judgment:{ on:['allZhi'], value:['辰']}},
          { trigger:{ on:['dayGan'], value:['己']}, judgment:{ on:['allZhi'], value:['辰']}},
          { trigger:{ on:['dayGan'], value:['庚']}, judgment:{ on:['allZhi'], value:['戌']}},
          { trigger:{ on:['dayGan'], value:['辛']}, judgment:{ on:['allZhi'], value:['酉']}},
          { trigger:{ on:['dayGan'], value:['壬']}, judgment:{ on:['allZhi'], value:['子']}},
          { trigger:{ on:['dayGan'], value:['癸']}, judgment:{ on:['allZhi'], value:['申']}}
      ]
    },
    {
        name: '孤辰',
        comment: '孤辰',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearZhi'], value:['亥','子','丑']}, judgment:{ on:['allZhi'], value:['寅']}},
          { trigger:{ on:['yearZhi'], value:['寅','卯','辰']}, judgment:{ on:['allZhi'], value:['巳']}},
          { trigger:{ on:['yearZhi'], value:['巳','午','未']}, judgment:{ on:['allZhi'], value:['申']}},
          { trigger:{ on:['yearZhi'], value:['申','酉','戌']}, judgment:{ on:['allZhi'], value:['亥']}}
      ]
    },
    {
        name: '寡宿',
        comment: '寡宿',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearZhi'], value:['亥','子','丑']}, judgment:{ on:['allZhi'], value:['戌']}},
          { trigger:{ on:['yearZhi'], value:['寅','卯','辰']}, judgment:{ on:['allZhi'], value:['丑']}},
          { trigger:{ on:['yearZhi'], value:['巳','午','未']}, judgment:{ on:['allZhi'], value:['辰']}},
          { trigger:{ on:['yearZhi'], value:['申','酉','戌']}, judgment:{ on:['allZhi'], value:['未']}}
      ]
    },
    {
        name: '六厄',
        comment: '六厄',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearZhi'], value:['申','子','辰']}, judgment:{ on:['allZhi'], value:['卯']}},
          { trigger:{ on:['yearZhi'], value:['寅','午','戌']}, judgment:{ on:['allZhi'], value:['酉']}},
          { trigger:{ on:['yearZhi'], value:['巳','酉','丑']}, judgment:{ on:['allZhi'], value:['子']}},
          { trigger:{ on:['yearZhi'], value:['亥','卯','未']}, judgment:{ on:['allZhi'], value:['午']}}
      ]
    },
    {
        name: '魁罡',
        comment: '魁罡',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayPillar'], value:['壬辰']}, judgment:{ on:'allPillar', value:['壬辰','庚戌','庚辰','戊戌']}},
          { trigger:{ on:['dayPillar'], value:['庚戌']}, judgment:{ on:'allPillar', value:['壬辰','庚戌','庚辰','戊戌']}},
          { trigger:{ on:['dayPillar'], value:['庚辰']}, judgment:{ on:'allPillar', value:['壬辰','庚戌','庚辰','戊戌']}},
          { trigger:{ on:['dayPillar'], value:['戊戌']}, judgment:{ on:'allPillar', value:['壬辰','庚戌','庚辰','戊戌']}}
      ]
    },
    {
        name: '阴差阳错',
        comment: '阴差阳错',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayPillar'], value:['丙子']}, judgment:{ on:['dayPillar'], value:['丙子']}},
          { trigger:{ on:['dayPillar'], value:['丁丑']}, judgment:{ on:['dayPillar'], value:['丁丑']}},
          { trigger:{ on:['dayPillar'], value:['戊寅']}, judgment:{ on:['dayPillar'], value:['戊寅']}},
          { trigger:{ on:['dayPillar'], value:['辛卯']}, judgment:{ on:['dayPillar'], value:['辛卯']}},
          { trigger:{ on:['dayPillar'], value:['壬辰']}, judgment:{ on:['dayPillar'], value:['壬辰']}},
          { trigger:{ on:['dayPillar'], value:['癸巳']}, judgment:{ on:['dayPillar'], value:['癸巳']}},
          { trigger:{ on:['dayPillar'], value:['丙午']}, judgment:{ on:['dayPillar'], value:['丙午']}},
          { trigger:{ on:['dayPillar'], value:['丁未']}, judgment:{ on:['dayPillar'], value:['丁未']}},
          { trigger:{ on:['dayPillar'], value:['戊申']}, judgment:{ on:['dayPillar'], value:['戊申']}},
          { trigger:{ on:['dayPillar'], value:['辛酉']}, judgment:{ on:['dayPillar'], value:['辛酉']}},
          { trigger:{ on:['dayPillar'], value:['壬戌']}, judgment:{ on:['dayPillar'], value:['壬戌']}},
          { trigger:{ on:['dayPillar'], value:['癸亥']}, judgment:{ on:['dayPillar'], value:['癸亥']}}
      ]
    },
    {
        name: '十恶大败',
        comment: '十恶大败',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayPillar'], value:['甲辰']}, judgment:{ on:['dayPillar'], value:['甲辰']}},
          { trigger:{ on:['dayPillar'], value:['乙巳']}, judgment:{ on:['dayPillar'], value:['乙巳']}},
          { trigger:{ on:['dayPillar'], value:['丙申']}, judgment:{ on:['dayPillar'], value:['丙申']}},
          { trigger:{ on:['dayPillar'], value:['丁亥']}, judgment:{ on:['dayPillar'], value:['丁亥']}},
          { trigger:{ on:['dayPillar'], value:['戊戌']}, judgment:{ on:['dayPillar'], value:['戊戌']}},
          { trigger:{ on:['dayPillar'], value:['己丑']}, judgment:{ on:['dayPillar'], value:['己丑']}},
          { trigger:{ on:['dayPillar'], value:['庚辰']}, judgment:{ on:['dayPillar'], value:['庚辰']}},
          { trigger:{ on:['dayPillar'], value:['辛巳']}, judgment:{ on:['dayPillar'], value:['辛巳']}},
          { trigger:{ on:['dayPillar'], value:['壬申']}, judgment:{ on:['dayPillar'], value:['壬申']}},
          { trigger:{ on:['dayPillar'], value:['癸亥']}, judgment:{ on:['dayPillar'], value:['癸亥']}}
      ]
    },
    {
        name: '天罗',
        comment: '天罗',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearPillar'], value:['戊子','己丑','丙寅','丁卯','甲辰','乙巳','戊午','己未','丙申','丁酉','甲戌','乙亥']}, judgment:{ on:'dayZhi', value:['戌','亥']}}
      ]
    },
    {
        name: '地网',
        comment: '地网',
        preconditions: [],
        rules: [
          { trigger:{ on:['yearPillar'], value:['丙子','丁丑','甲寅','乙卯','壬辰','癸巳','丙午','丁未','甲申','乙酉','壬戌','癸亥','庚子','辛丑','戊寅','己卯','丙辰','丁巳','庚午','辛未','戊申','己酉','丙戌','丁亥']}, judgment:{ on:['dayZhi'], value:['辰','巳']}}
      ]
    },
    {
        name: '四废',
        comment: '四废',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayPillar'], value:['庚申']}, judgment:{ on:['dayPillar'], value:['庚申']}},
          { trigger:{ on:['dayPillar'], value:['辛酉']}, judgment:{ on:['dayPillar'], value:['辛酉']}},
          { trigger:{ on:['dayPillar'], value:['壬子']}, judgment:{ on:['dayPillar'], value:['壬子']}},
          { trigger:{ on:['dayPillar'], value:['癸亥']}, judgment:{ on:['dayPillar'], value:['癸亥']}},
          { trigger:{ on:['dayPillar'], value:['甲寅']}, judgment:{ on:['dayPillar'], value:['甲寅']}},
          { trigger:{ on:['dayPillar'], value:['乙卯']}, judgment:{ on:['dayPillar'], value:['乙卯']}},
          { trigger:{ on:['dayPillar'], value:['丙午']}, judgment:{ on:['dayPillar'], value:['丙午']}},
          { trigger:{ on:['dayPillar'], value:['丁巳']}, judgment:{ on:['dayPillar'], value:['丁巳']}}
      ]
    },
    {
        name: '孤鸾煞',
        comment: '孤鸾煞',
        preconditions: [],
        rules: [
          { trigger:{ on:['hourPillar'], value:['乙巳','丁巳','辛亥','戊申','壬寅','戊午','壬子','丙午']}, judgment:{ on:['dayPillar'], value:['乙巳']}},
          { trigger:{ on:['hourPillar'], value:['乙巳','丁巳','辛亥','戊申','壬寅','戊午','壬子','丙午']}, judgment:{ on:['dayPillar'], value:['丁巳']}},
          { trigger:{ on:['hourPillar'], value:['乙巳','丁巳','辛亥','戊申','壬寅','戊午','壬子','丙午']}, judgment:{ on:['dayPillar'], value:['辛亥']}},
          { trigger:{ on:['hourPillar'], value:['乙巳','丁巳','辛亥','戊申','壬寅','戊午','壬子','丙午']}, judgment:{ on:['dayPillar'], value:['戊申']}},
          { trigger:{ on:['hourPillar'], value:['乙巳','丁巳','辛亥','戊申','壬寅','戊午','壬子','丙午']}, judgment:{ on:['dayPillar'], value:['壬寅']}},
          { trigger:{ on:['hourPillar'], value:['乙巳','丁巳','辛亥','戊申','壬寅','戊午','壬子','丙午']}, judgment:{ on:['dayPillar'], value:['戊午']}},
          { trigger:{ on:['hourPillar'], value:['乙巳','丁巳','辛亥','戊申','壬寅','戊午','壬子','丙午']}, judgment:{ on:['dayPillar'], value:['壬子']}},
          { trigger:{ on:['hourPillar'], value:['乙巳','丁巳','辛亥','戊申','壬寅','戊午','壬子','丙午']}, judgment:{ on:['dayPillar'], value:['丙午']}}
      ]
    },
    {
        name: '空亡',
        comment: '空亡',
        preconditions: [],
        rules: [
          { trigger:{ on:['dayPillar'], value:['甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉']}, judgment:{ on:['allZhi'], value:['戌','亥']}},
          { trigger:{ on:['dayPillar'], value:['甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未']}, judgment:{ on:['allZhi'], value:['申','酉']}},
          { trigger:{ on:['dayPillar'], value:['甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳']}, judgment:{ on:['allZhi'], value:['午','未']}},
          { trigger:{ on:['dayPillar'], value:['甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯']}, judgment:{ on:['allZhi'], value:['辰','巳']}},
          { trigger:{ on:['dayPillar'], value:['甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑']}, judgment:{ on:['allZhi'], value:['寅','卯']}},
          { trigger:{ on:['dayPillar'], value:['甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥']}, judgment:{ on:['allZhi'], value:['子','丑']}}
      ]
    }
];

export default shenshaRules;