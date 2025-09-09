# Node.js 八字计算服务重构与优化项目说明文档 (V1.3)

## 第一部分：项目概述与核心数据模型

### 1. 项目背景与目标

#### 1.1 背景
本项目旨在将一个已有的 Python 八字计算脚本 (`bazi_calculator.py`) 迁移并重构为一个现代化的 Node.js 服务。原 Python 脚本虽然功能完备，但在代码结构、数据输出格式以及计算效率上存在优化空间。

#### 1.2 核心目标
- **技术栈迁移**：从 Python 迁移至 Node.js。
- **功能完整性**：完整复现原脚本的所有核心功能，包括四柱排盘、大运流年推算、刑冲合害分析及神煞计算。
- **架构优化**：采用全新的、结构化的、面向对象的 JSON 数据模型，提高数据的可读性、可维护性，并优化前端渲染效率。
- **逻辑优化**：刑冲合害及神煞计算部分应该严格遵循提供的 Mermaid 流程图 (`mermaid_harm.md`, `mermaid_shensha.md`) 作为核心算法的实现指导。
- **依赖管理**：使用 NPM 包 `lunar-javascript` 作为核心的底层八字排盘引擎。

#### 1.3 输入与输出
- **输入**：
  - `gregorianDate` (字符串)：公历出生日期及时间，格式如 `YYYY-MM-DD HH:mm`。
  - `gender` (字符串)：性别，`男` 或 `女`。
- **输出**：
  - 一个结构化的 JSON 对象，详细定义见下文"核心数据模型"及"最终输出结构"。

#### 1.4 项目资产清单
接手者将获得以下文件作为项目参考和实现依据：
- `bazi_calculator.py`：原 Python 脚本，作为核心业务逻辑的参考。
- `lunar_PART.md`：`lunar-javascript` 库的部分使用说明。
- `HarmRules.js`：刑冲合害关系的规则定义文件。
- `shenshaRules.js`:神煞计算的规则模块，采用灵活的、可嵌套的、统一的规则结构。
- `/data/*.js (例如 NA_YIN.js, SHI_SHEN_GAN.js 等)`:包含纳音、十神等核心对照表的数据模块。
- `mermaid_harm.md`：刑冲合害计算的逻辑流程图。
- `mermaid_shensha.md`：神煞计算的逻辑流程图。

---

### 2. 核心数据模型定义
为了实现项目目标，我们将摒弃原脚本的输出格式，采用以下全新的、面向对象的数据模型。所有计算和分析都将围绕这些标准化的数据对象进行。

#### 2.1 唯一标识符 (ID) 体系
为了在关系和神煞中精确引用，我们为每个核心元素（干、支、柱）定义一套清晰的 ID 体系。

- **原局**：
  - 年：`yg` (年干), `yz` (年支), `yp` (年柱)
  - 月：`mg` (月干), `mz` (月支), `mp` (月柱)
  - 日：`dg` (日干), `dz` (日支), `dp` (日柱)
  - 时：`tg` (时干), `tz` (时支), `tp` (时柱)

- **起运前**：
  - 容器ID: qyq，用于唯一标识"起运前"这个特殊时间段。
  - 流年: ln0_{j} (j 从 0 开始)，索引 0 代表此流年属于"起运前" (qyq) 区间。
  - 小运: xy0_{j} (j 从 0 开始)。小运ID与"起运前"的流年ID索引保持一致。
      - xy0_{j}g (小运天干), xy0_{j}z (小运地支)。这两个ID将被用于baziIndex，以实现关系查找。

- **正式大运**：
  - `dy{i}` (i 从 1 开始)，例如：`dy1g`, `dy1z`, `dy1p` (第一大运的干、支、柱)。
  - 流年ln{i}_{j} (i 从 1 开始)，例如：ln1_0p (第一大运中第一个流年的柱)。

- **流年**：
  - `ln{i}_{j}` 注意起运前和正式大运。

- **小运**：
  - xiaoYun 字段，用于存储与该流年一一对应的“小运”信息。根据项目优化决策，此字段的规则如下：
    - 当流年处于“起运前”阶段：xiaoYun 的值为一个包含小运ID和干支信息的对象，例如：{ "id": "xy0_0", "value": "辛巳" }。
    - 当流年处于正式大运阶段：xiaoYun 的值为 null。


#### 2.2 数据对象结构

- **天干对象 (Gan)**：
  ```json
  {
    "id": "yg",
    "type": "年干",
    "value": "甲",
    "shishen": "比肩",
    "shensha": ["天乙贵人"]
  }
  ```

- **地支对象 (Zhi)**：
  ```json
  {
    "id": "yz",
    "type": "年支",
    "value": "子",
    "canggan": [
      { "gan": "癸", "shishen": "正印" }
    ],
    "shensha": ["桃花"]
  }
  ```

- **柱对象 (Pillar)**：
  这是一个基础接口，不同类型的柱会继承并扩展它。

  - **原局柱 (OriginalPillar)**：
    ```json
    {
      "id": "yp",
      "type": "年柱",
      "value": "甲子",
      "gan": { /* Gan Object */ },
      "zhi": { /* Zhi Object */ },
      "nayin": "海中金",
      "shensha": ["亡神"]
    }
    ```

  - **大运柱 (DaYunPillar)**：
    ```json
    {
      "id": "dy1p",
      "type": "大运",
      "value": "乙丑",
      "gan": { /* Gan Object */ },
      "zhi": { /* Zhi Object */ },
      "nayin": "海中金",
      "shensha": [],
      "start_year": 2020,
      "end_year": 2029,
      "start_age": 10,
      "end_age": 19,
      "liunian":[...]
    }
    ```

  - **流年柱 (LiuNianPillar)**：
    ```json
    {
      "id": "ln0_0p", // 示例ID为起运前流年
      "type": "流年",
      "value": "庚子",
      "gan": { /* Gan Object */ },
      "zhi": { /* Zhi Object */ },
      "nayin": "壁上土",
      "shensha": [],
      "year": 2011,
      "age": 1
      "xiaoYun": {
          "id": "xy0_0", // 对应的小运ID
          "value": "辛巳"
      }
    }
    ```
    * **当流年处于“起运前”阶段**：`xiaoYun` 的值为一个包含小运干支信息的**对象**，例如：`{ "id": "xy0_0", "value": "辛巳" }`。
    * **当流年处于正式大运阶段**：`xiaoYun` 的值为 `null`。
---

#### 2.3 内部核心轮廓 (Internal Core Profile)
**说明**：此对象是 `baziService` 模块的核心产物，它将被包装在 `context` 对象中，在各个分析模块间流转。经团队决策，我们采纳 Jest 快照反映的结构作为当前和未来的事实标准。

```json
{
  "profile": {
    "gregorianDate": "2004-03-03 04:15",
    "gender": "女",
    "dayMaster": "辛"
  },
  "pillars": {
    "year": {
      "id": "yp",
      "type": "年柱",
      "value": "甲申",
      "nayin": "泉中水",
      "shensha": [],
      "gan": { /* Gan Object */ },
      "zhi": { /* Zhi Object */ }
    },
    "month": {
      "id": "mp",
      "type": "月柱",
      // ... 遵循 OriginalPillar 结构
    },
    "day": {
      "id": "dp",
      "type": "日柱",
      // ... 遵循 OriginalPillar 结构
    },
    "hour": {
      "id": "tp",
      "type": "时柱",
      // ... 遵循 OriginalPillar 结构
    }
  },
  "dayun": [
    {
      "id": "qyq",
      "type": "起运前",
      // ...
      "liunian": [
        {
          "id": "ln0_0p",
          "type": "流年",
          // ... 遵循 LiuNianPillar 结构
        }
      ]
    },
    {
      "id": "dy1p",
      "type": "大运",
      // ...
      "liunian": [
        {
          "id": "ln1_0p",
          "type": "流年",
          // ... 遵循 LiuNianPillar 结构
        }
      ]
    }
    // ... 更多大运
  ],
  "relations": [
      {
          "type": "四冲",
          "elements": ["tg", "yg"],
          "result": null
      }
  ]
}
```

### 3. 整体实现路径 (Implementation Path)
我们将分模块、分步骤地进行开发，以确保每个环节都清晰可控。整体流程如下：
1. **搭建环境与数据准备**：初始化项目，创建所有必需的文件和数据表。
2. **构建核心数据生成服务**：实现一个服务，它能接收输入，调用 `lunar-javascript`，并生成结构化的基础八字数据对象。
3. **开发上层分析模块**：独立开发刑冲合害计算器和神煞计算器。
4. **整合与输出**：将所有模块的计算结果整合，并按最终格式输出。
5. **测试与验证**：对比新旧版本的逻辑结果，确保准确性。

---

### 4. 模块设计与实现细节

#### 4.1 模块一：项目初始化与数据准备
- **Action 1**：在项目根目录下，运行 `npm init -y` 和 `npm install lunar-javascript`。
- **Action 2**：按照文档中描述的结构创建 `/src` 和 `/data` 目录及相应的 JS 文件。
- **Action 3**：：直接创建包含最终格式数据的JavaScript模块，例如 NA_YIN.js, SHI_SHEN_GAN.js, harmRules.js, shenshaRules.js等。这些模块将使用 export 导出常量对象或数组，供整个应用直接、高效地使用，无需任何运行时的数据转换。
  - `ZHI_HIDE_GAN` (地支藏干表)
    - "丑": [{ gan: "己", type: "本气"},{ gan: "癸", type: "中气"}, { gan: "辛", type: "余气"}]...
  - `SHI_SHEN_GAN` (天干十神对照表)
    - "甲": {"甲": "比肩", "乙": "劫财", "丙": "食神"...},
  - `NA_YIN` (六十甲子纳音表)
    - 甲子: '海中金',甲午: '沙中金',丙寅: '炉中火'...
  

#### 4.2 模块二：核心数据生成服务 (`/src/baziService.js`)
此模块是整个服务的核心引擎，负责调度 `lunar-javascript` 库并执行自定义的"丰富化"逻辑。

- **Action 1**: 创建主服务函数并初始化核心对象
    - 定义项目的主函数：`generateBaziProfile(gregorianDate, gender)`。
    - 在函数内部，首先调用 `lunar-javascript` 库，一键生成所有后续计算所需数据源—`EightChar` 对象。
        ```javascript
        const { Lunar } = require('lunar-javascript');
        const eightChar = Lunar.fromDate(new Date(gregorianDate)).getEightChar();
        ```
- **Action 2**: 生成原局四柱 (OriginalPillar)
    - 此过程用于处理年、月、日、时四柱。
    - 处理方式：调用`eightChar`对象自带的方法来获取所有属性（`shishen`, `canggan`, `nayin` 等）。由于库本身已对原局信息有完整支持，故此步骤不使用我们自定义的缓存和计算逻辑。
        - 。注意：该库的API设计存在不一致性，部分数据通过方法调用（带()）获取，而部分基础数据通过属性（不带()）直接访问。 在实现时必须严格区分。
        - 通过【属性】访问 (不带 () )
        - 通过【方法】调用 (带 () )
        - 详细见lunar-JavaScript库使用方法
    - 流程: 遍历四柱，通过调用 `eightChar.getYear`, `eightChar.getYearShiShenGan()`, `eightChar.getYearHideGan()`, `eightChar.getYearShiShenZhi()`, `eightChar.getYearNaYin()` 等系列方法，创建并填充4个完整的 `OriginalPillar` 对象。

- **Action 3**: 精确处理大运、流年与小运 (Precisely Process DaYun, LiuNian, and XiaoYun)
    - 核心目标：遍历由 lunar-javascript 生成的所有大运和流年，对每一个"裸"的干支进行手动的"丰富化"处理。同时，根据我们清晰的ID体系(qyq, ln0_x, xy0_x)构建数据对象。
    - 核心流程: 
        - 获取日主天干与构建预计算缓存 (前置优化):
            - 在所有遍历开始前，首先从原局日柱中确定日主天干 dayMaster。
            - 执行性能优化：基于 dayMaster，立即创建 ganInfoCache (天干信息缓存) 和 zhiInfoCache (地支信息缓存)。这一步将十神、藏干等信息一次性计算好，存入缓存备用。
        - 遍历所有大运区间：循环遍历 eightChar.getYun(gender).getDaYun() 返回的数组。该数组的第一个元素 (index === 0) 代表"起运前"时期。设外层循环索引为 i，内层流年循环索引为 j。
          - 特殊区间处理（"起运前"，当 i === 0）：当处理大运数组的第一个元素时，必须遵循以下规则来构建该特殊的"起运前"容器对象：
              - id: 固定设置为字符串 "qyq"。
              - type：其 type 字段应明确设为 "起运前"。
              - 柱属性：由于"起运前"是一个时间区间而非具体的天干地支柱，其本身不具备柱的属性。因此，value, gan, zhi, nayin 字段必须设置为 null。
              - shensha：为保证数据类型一致性（所有 shensha 字段都应为数组），此处的 shensha 字段应设置为空数组 []。
              - 起止信息：此区间的 start_year, end_year, start_age, 和 end_age 字段需要被动态计算并填充，以准确表示其时间范围。
          - 常规大运处理（当 i > 0）: 对于数组中后续的所有标准大运，则按照 DaYunPillar 的标准模型正常填充所有字段。其ID使用循环索引 i 生成，格式为 dy{i}p (例如 dy1p)。
        - 同步获取流年与小运: 在循环内部，通过调用 daYun.getLiuNian() 和 daYun.getXiaoYun() 获取当前大运区间内一一对应的流年和小运列表。
        - 构建流年与小运（统一逻辑）：
            - 遍历当前大运（或起运前）区间内的流年列表，设循环索引为 j。
            - a. 确定ID:
                  - 如果 i === 0 (起运前)，流年ID为 ln0_{j}p (如ln0_0p)，小运ID为 xy0_{j} (如 xy0_0)。
                  - 如果 i > 0 (正式大运)，流年ID为 ln{i}_{j}p (如 ln1_0p)。
            - b. 处理小运数据:
                  - 如果 i === 0 (起运前)，获取对应的 xiaoYun 干支，与上一步生成的 xy0_{j} ID一同组装成一个对象，例如 { "id": "xy0_0", "value": "辛巳" }。
                  - 如果 i > 0 (正式大运)，xiaoYun 数据直接设为 null。
            - c. 丰富化: 
                  - 获取当前流年柱的干支值，例如天干为 currentGan, 地支为 currentZhi。
                  - 获取nayin (纳音)：此项无缓存，直接查 NA_YIN 表。
                  - 获取天干十神：【应用缓存】 直接从第一步创建的 ganInfoCache 中以 O(1) 的效率获取。
                      ```JavaScript
                      const shiShen = ganInfoCache[currentGan].shishen;
                      ```
                  - 获取地支藏干与十神：【应用缓存】 直接从第一步创建的 zhiInfoCache 中以 O(1) 的效率获取完整的藏干对象数组。
                      ```JavaScript
                      const cangGan = zhiInfoCache[currentZhi].canggan;
                      ```
            - d. 组装: 将ID、小运数据、纳音、以及从缓存中获取的十神和藏干信息，组装成最终的 LiuNianPillar 对象，并存入对应的容器中。

- **Action 4**: 创建统一计算上下文 (Create Unified Calculation Context)
    - 核心目标：在所有分析开始前，一次性地创建包含所有预处理数据和索引的"中央工具箱"，供所有下游分析模块共享使用，避免重复计算。
    - 执行流程：
        - a.基于已生成的baziProfile，创建一个context对象。
        - b. 构建 flatMap：遍历 baziProfile，提取所有关键的单点信息（如日干、年纳音、各柱干支值等），存入 context.flatMap，用于快速直接查询。
            - 此Map必须包含所有"单点定位"所需的值及其对应的ID
            - flatMap.set('dayId', 'dp'), flatMap.set('yearGanId', 'yg') 等，用于后续快速查找。
        - c. 构建 baziIndex：遍历 baziProfile，为所有大运、流年、以及原局四柱的天干和地支建立"值 -> ID列表"的反向索引，存入 context.baziIndex。
        - d. 补充处理小运数据 
            - 专门遍历"起运前"的流年 (context.baziProfile.dayun[0].liunian)。
            - 对于每一个流年对象（设其在数组中的索引为 j），读取其 xiaoYun 属性，例如 { id: "xy0_j", value: "辛巳" }。
            - 将 xiaoYun.value ("辛巳") 分解为天干 "辛" 和地支 "巳"。
            - 为它们创建新的ID：xy0_{j}g 和 xy0_{j}z。
            - 将这两个ID补充到 context.baziIndex 中。例如，更新 baziIndex['辛'] 数组，向其中推入 xy0_{j}g。
    - 最终产出：此模块最终向后传递的不再是baziProfile本身，而是包含了baziProfile、gender、flatMap和baziIndex的完整context对象。

#### 4.3 模块三：刑冲合害计算部分
此模块的职责是，利用context中预先建立的索引，高效地计算出八字中所有天干地支之间存在的刑冲合害关系。其算法需要能够解析/data/harmRules.js中定义的多层级规则结构。

- **Action 1**:  定义主函数与初始化
    - 定义主函数 calculateHarmRelations(context)，它接收包含所有预处理数据的 context 对象。
    - 通过 import 语句从 /data/harmRules.js 导入 harmRules 对象。
    - 初始化一个空数组 const relations = []; 用于存储最终的计算结果。

- **Action 2**: 分层遍历规则，动态处理
    - 算法的核心不再是遍历一个单一的规则列表，而是分层遍历导入的harmRules对象。程序将依次处理tiangan, dizhi_2_char, dizhi_3_char, dizhi_self等每一个类别。
    - 对于每一个类别（例如dizhi_2_char），程序将遍历该对象下的所有键（例如"丑子", "亥寅"等）。

- **Action 3**: 基于层级的关系生成逻辑
    - 对于每一个规则键（如"丑子"、"丑戌未"），执行以下流程：
        - a. 分解规则键并查询索引
          - 键名规范化：harmRules.js 中的所有二元组合键（如天干合、地支六合等）都遵循Unicode升序的原则进行定义，例如"己甲"而非"甲己"，"丑子"而非"子丑"。因此，在进行查询前，程序必须先将待查询的两个字（干或支）按Unicode码点排序，然后再拼接成字符串键，以确保能命中规则。
          - 天干权威顺序 (Unicode升序)： ["丁", "丙", "乙", "壬", "己", "庚", "戊", "甲", "癸", "辛"]
          - 地支权威顺序 (Unicode升序)： ["丑", "亥", "午", "卯", "子", "寅", "巳", "戌", "未", "申", "辰", "酉"]
          - 将上面这两个数组或其索引存储为常量。当需要生成一个组合键时（例如，处理"甲"和"己"的关系），通过查找它们在列表中的索引来判断顺序。
        - b. ID分类：这是新增的关键步骤。将上一步查询到的所有ID列表，按其类型（原局-B, 大运-D, 流年-L,小运-X）进行归类。我们可以通过ID的格式来判断其类型（例如，yz是B，dy1z是D，ln1_0z是L，xy0_0z是X）。
            - 例如，对于'丑'和'子'，我们得到的ID列表可能被分类为：
            {'丑': { D: ['dy1z'] },'子': { B: ['yz', 'dz'], L: ['ln2_0z'], X: ['xy0_0z'] }}
        - c. 按有效模式生成组合：抛弃笛卡尔积，改为根据预定义的有效模式（如BB, BD, BL, DL, BX, LX, BBB, BBD, BBL, BDL, BBX, BLX）来生成组合。
            - 对于二字组合 "丑子"：
                - 尝试BD模式：从丑的D类ID和子的B类ID中生成组合 -> ['dy1z', 'yz'], ['dy1z', 'dz']。
                - 尝试DL模式：从丑的D类ID和子的L类ID中生成组合 -> ['dy1z', 'ln2_0z']。
                   -  校验逻辑: 必须确保流年属于该大运。实现方式为：parseDaYunIndex(d_id) 的结果必须严格等于 parseDaYunIndex(l_id) 的结果。例如，dy6z 只能与 ln6_ 系列的ID组合。
                - 尝试BB模式：丑如果没有B类ID，跳过。
                - 尝试BL模式：丑如果没有B类ID，跳过。
                - 尝试BX模式：同上。
                - 尝试LX模式：同上。
                    - 校验逻辑:必须确保流年和小运的索引完全一致。实现方式为：从ID（ln0_j 和 xy0_k）中解析出的索引 j 和 k 必须相等。
                - 检查DD, LL等无效模式，直接跳过。
            - 对于三字组合 "丑戌未"：
                - 同样地，只生成符合BBB, BBD, BBL, BDL, BBX, BLX这六种模式的ID三元组。
                    - 其中BDL同DL，需要确保流年属于该大运。
                    - 其中BLX同LX，需要确保流年和小运索引完全一致。
        - d. 创建关系对象：为每一个成功生成的ID组合，根据规则的值（例如 { "type": ["六合"], "result": "土" }），创建一个或多个关系对象，并将其推入 relations 数组。
            ```json
            {
              "type": "六合",
              "elements": ["dy1z", "yz"],
              "result": "土" 
            }
            ```

- **Action 4**:  返回最终结果
当harmRules对象中的所有类别和所有规则都遍历并处理完毕后，函数返回最终的 relations 数组。


#### 4.4 模块四：神煞计算部分 (shenshaCalculator.js)
此模块是神煞计算的核心引擎。它通过解析 /data/shenshaRules.js 中定义的规则，来动态地为八字命盘标记神煞。其执行逻辑严格遵循以下步骤：

- **Action 1**: 定义主函数与初始化
    - 定义主函数 calculateShensha(context)，它接收包含所有预处理数据的 context 对象。
    - 初始化一个空的 shenshaResults 对象或直接准备修改 context.baziProfile。
    -  函数实现必须具备高健壮性，当遇到shenshaRules.js中格式不完整或错误的规则时，应能安全跳过，而不是导致程序崩溃。

- **Action 2**: 主循环：遍历所有神煞定义
    - 程序开始遍历从 shenshaRules.js 中导入的 shenshaRules 规则数组。
    - 对于数组中的每一个 shensha 对象（如"元辰"、"华盖"），程序将独立地、从头开始执行下面的所有步骤。

- **Action 3**: 前提条件检查 (Precondition Check)
    - 这是对一个神煞规则进行计算的第一道关卡。
    - a. 分支处理：检查当前 shensha 对象是否存在 branches 属性。
        - 若存在，则遍历branches数组，对每个branch执行 b步骤。一旦找到第一个满足前提条件的分支，则只采用该分支的rules进入Action 4，并跳过所有后续分支。
        - 若不存在，则直接对顶层的preconditions属性执行 b步骤。
    - b. 条件检查：使用一个checkPreconditions辅助函数来判断前提条件是否满足。该函数能够解析我们定义的统一格式：
        - 检查preconditions是简单数组（且逻辑）还是包含logic: 'or'的对象（或逻辑）。
        - 利用 context.gender 和 context.flatMap 中的信息（如通过flatMap.get('dayGan')获取日干）来验证每一条具体的条件。
        - 只有前提条件检查通过，程序才会继续；否则，将立即停止对当前神煞（或分支）的计算，进入下一个神煞的判断。
        - checkPreconditions 辅助函数必须足够健壮。在尝试访问 condition.on 或 condition.value 等属性前，必须检查condition对象本身及其属性是否存在。如果数据不完整，应视作条件不满足并安全返回false。

- **Action 4**: 执行规则：寻找触发器 (Find Trigger)
    - 前提通过后，程序开始遍历对应的rules数组（这是一个或逻辑，满足其中一条即可）。
    - 对于rules数组中的每一个rule对象，执行以下操作：
        - a. 对于每一条rule，必须先验证其基本结构的完整性（例如 rule.trigger 和 rule.judgment 对象是否存在），如果不存在则安全跳过。
        - b. 确定触发位置：读取rule.trigger.on的值。它可能是一个字符串（如'yearNaYin'）或字符串数组（如['yearZhi', 'dayZhi']）。
        - c. 寻找触发实例：遍历所有指定的触发位置，寻找第一个满足条件的确切实例。
            - 特殊路径（如纳音）：若on值为'yearNaYin'，则从context.flatMap中直接获取年柱纳音的值进行判断。
            - 常规路径：对于'yearZhi'等常规位置，从context.flatMap中获取该位置的值，并检查该值是否存在于rule.trigger.value数组中。
        - d. 记录与流转：
            - 如果在任何一个触发位置上找到了匹配，程序会立即将这个触发元素的唯一ID（例如yz）存入一个临时的triggerId变量。然后，立即停止对其他触发位置的搜索，带着这个triggerId进入Action 5。
            - 如果遍历完所有指定的触发位置都没有找到匹配，则当前这条rule失败，程序跳到rules数组的下一条rule。

- **Action 5**: 定位目标与最终标记 (Locate Targets & Final Marking)
    - 一旦触发器被找到，程序就进入最后的定位与标记阶段。
    - a. 确定判断逻辑：读取rule.judgment对象的内容，包括on（判断位置），value（期望值），以及可选的exclude_trigger标志。记得验证judgment.on和judgment.value是否存在。
    - b. 定位目标元素ID列表：根据judgment.on的值，采用不同的策略来获取一个包含所有潜在目标元素ID的列表。
        - 范围定位 (如 'allZhi', 'allGan'): 直接使用 context.baziIndex 来高效获取所有符合judgment.value中任意一个值的元素ID列表。
        - 全柱定位 (如 'allPillar'): 进行一次"即时计算"，遍历context.baziProfile中的所有柱对象，找出符合judgment.value的柱ID列表。
        - 单点定位 (如 'dayPillar', 'hourZhi'): 直接从context.flatMap中获取该位置的ID，构成只包含一个元素的目标ID列表。
    - c. 应用排除规则 (Exclusion)：检查judgment对象中是否有 "exclude_trigger": true。
        - 如果为true，则从上一步获得的目标ID列表中，移除在Action 4中记录的那个triggerId。
    - d. 执行标记：遍历最终确定的目标ID列表。对于列表中的每一个ID，找到context.baziProfile中对应的对象（干、支或柱），并将其shensha数组属性中推入（push）当前神煞的名称。

#### 4.5 模块五：整合与最终输出 (baziService.js 中)
该模块的核心任务是在所有计算完成后，将 context 对象中分散的数据，整合成一个结构清晰、符合最终输出要求的JSON对象。
- **Action 1**: 主服务收尾，整合所有计算结果
    - 在主服务函数 generateBaziProfile 中，当 calculateHarmRelations(context) 和 calculateShensha(context) 都执行完毕后，我们的 context 对象已经包含所需要的数据：
        a.一份被神煞计算直接修改并丰富过的 context.baziProfile，其中包含了结构完整的原局四柱和嵌套好的大运/流年数据。
        b.一个由刑冲合害计算返回的、包含所有关系的 relations 数组。

- **Action 2**: 构建并返回最终的输出对象
    - 创建一个顶层的 finalOutput 对象。
    - 从 context 对象中提取各部分数据，按照最终确定的格式，置入 finalOutput 对象的相应键中。特别注意，liunian 数据已经内嵌于 dayun 中，不应再有顶层的 liunian 键。
    - 代码逻辑示例：
      ```JavaScript
      // (在主服务 generateBaziProfile 的末尾)

        // ... 调用完所有 calculator ...

        // 从 context.flatMap 中获取日主，这是一个常用且重要的信息
        const dayMaster = context.flatMap.get('dg'); 

        const finalOutput = {
            profile: {
                gregorianDate: gregorianDate, // 输入的公历日期
                gender: gender,             // 输入的性别
                dayMaster: dayMaster          // 日主天干
            },
            pillars: {
                year: context.baziProfile.yearPillar,
                month: context.baziProfile.monthPillar,
                day: context.baziProfile.dayPillar,
                hour: context.baziProfile.hourPillar
            },
            // 大运数据已包含嵌套的流年数据
            dayun: context.baziProfile.dayun,
            relations: relations // 刑冲合害的计算结果
        };

        return finalOutput;
      ```

架构重大更新说明 (V3.1) - 数据库驱动重构
为提升项目性能、自主可控性及长期可维护性，项目核心服务 baziService.js 已完成一次重大重构。本次更新的核心目标是彻底移除对第三方库 lunar-javascript 的依赖，转而采用项目自有的本地数据库作为核心数据源。

核心变化总结
1. 移除 lunar-javascript 库
项目中所有与八字排盘、节气计算、大运推排相关的功能，现已不再调用 lunar-javascript 库。这使得我们的核心逻辑完全透明化，并摆脱了对外部库黑盒计算的依赖。

2. 引入本地数据库作为唯一数据源
所有基础数据的获取，现在完全依赖于项目 data/ 目录下的两个核心数据库：

bazi_data.db: 提供 1900-2099 年所有时辰的精确四柱干支。

SolarTerms.db: 提供 1900-2099 年所有节气的精确时间。

databaseService.js 作为全新的数据服务层，现在是获取所有原始命理数据的唯一入口。

3. 核心算法内置化
baziService.js 现已内置了所有核心的命理计算算法，包括：

起运时间计算: 基于数据库中的节气时间，精确计算起运时刻。

“立春换年”规则: 严格遵循以“立春”作为干支年分界点的核心业务逻辑。

大运、流年、小运推排: 基于60甲子序列表和数据库数据，自主完成所有运势的推算。

4. 全面转向异步架构
为配合数据库的异步查询特性，baziService.js 的核心函数（如 generateBaziProfile）已全面升级为 async/await 异步模型。这确保了在进行 I/O 操作时程序的性能和稳定性。

对下游服务的影响
本次重构的一个核心设计原则是保持对下游服务的100%兼容性。
尽管内部实现发生了翻天覆地的变化，但 baziService.js 最终输出给 harmCalculator.js 和 shenshaCalculator.js 的 context 对象（包含 baziProfile, baziIndex, flatMap）的数据结构、ID体系和内容与旧版本完全一致。
因此，harmCalculator.js 和 shenshaCalculator.js 无需任何代码改动。

全新的开发工作流
随着快照测试的移除，我们引入了全新的自动化工具以简化开发流程：

update-frontend-mock.js: 这是一个强大的自动化脚本，允许开发者通过命令行直接传入命例参数（日期和性别），即可一键完成数据生成、前端模拟文件 (mock-bazi-data.ts) 更新、以及本地 bazi-output.json 文件生成的所有工作。

推荐使用 npm run 快捷方式：已在 package.json 中配置了 update-mock 脚本，推荐使用以下命令进行操作：

Bash

npm run update-mock -- "YYYY-MM-DD HH:MM:SS" 性别
本次架构升级，标志着项目后端核心已进入一个更稳定、更高效、完全自主可控的新阶段。

架构重大更新说明 (V3.2) - 功能扩展与算法升级
在V3.1数据库驱动重构的基础上，我们对核心算法进行了升级，并新增了数个用于进阶分析的附属功能。所有新功能均已模块化的方式实现，以保证核心服务的稳定与清晰。

1. 起运算法升级 (流派2)
为追求更高的历法精度，起运时间的计算方法已由传统的“3天=1年”（流派1），全面升级为**“分钟基准法”（流派2）**。

核心算法: 严格按照 4320分钟 = 1年，360分钟 = 1个月，12分钟 = 1天 的规则进行换算。

新增精确起运时刻: 计算结果中新增了精确的起运公历时刻。

获取路径: 在最终输出的JSON对象中，可以通过 profile.exactQiYunDate 获取。

格式: "YYYY-MM-DD HH:00:00"

2. 新增附属功能模块 (auxiliaryCalculator.js)
所有新增的进阶分析功能，均已封装在全新的 bazi-backend/src/auxiliaryCalculator.js 模块中。该模块接收由 baziService.js 生成的 context 对象，进行二次加工，并将结果直接挂载回 baziProfile 的对应数据结构中。

这种设计确保了 baziService.js 职责的单一性，并使得未来新增其他附属功能变得简单、安全。

3. 新增功能详解与数据获取路径
a. 月令司令 (YueLingSiLing)
功能: 根据“月令分日用事”规则，精确计算出生当天，月令的司令天干。

数据结构修改: 在月柱对象 (MonthPillar) 中，新增 yueLingSiLing 属性。

获取路径: yuanju.month.yueLingSiLing
```Json
  "month": {
  "id": "mp",
  "type": "月柱",
  "value": "壬辰",
  "yueLingSiLing": "戊", // <--- 新增属性
  "gan": { ... },
  "zhi": { ... }
}
```
编码助手

显示思路
好的，我们来为项目文档做一次重要的更新，将我们最近的所有心血和成果都清晰地记录下来。这对于项目的长期维护至关重要。

请您将以下 Markdown 格式的文本，完整地复制并粘贴到您 bazi-backend/doc/Optimization Guide.md 文件的最末尾即可。

<br>

架构重大更新说明 (V3.2) - 功能扩展与算法升级
在V3.1数据库驱动重构的基础上，我们对核心算法进行了升级，并新增了数个用于进阶分析的附属功能。所有新功能均已模块化的方式实现，以保证核心服务的稳定与清晰。

1. 起运算法升级 (流派2)
为追求更高的历法精度，起运时间的计算方法已由传统的“3天=1年”（流派1），全面升级为**“分钟基准法”（流派2）**。

核心算法: 严格按照 4320分钟 = 1年，360分钟 = 1个月，12分钟 = 1天 的规则进行换算。

新增精确起运时刻: 计算结果中新增了精确的起运公历时刻。

获取路径: 在最终输出的JSON对象中，可以通过 profile.exactQiYunDate 获取。

格式: "YYYY-MM-DD HH:00:00"

2. 新增附属功能模块 (auxiliaryCalculator.js)
所有新增的进阶分析功能，均已封装在全新的 bazi-backend/src/auxiliaryCalculator.js 模块中。该模块接收由 baziService.js 生成的 context 对象，进行二次加工，并将结果直接挂载回 baziProfile 的对应数据结构中。

这种设计确保了 baziService.js 职责的单一性，并使得未来新增其他附属功能变得简单、安全。

3. 新增功能详解与数据获取路径
a. 月令司令 (YueLingSiLing)
功能: 根据“月令分日用事”规则，精确计算出生当天，月令的司令天干。

数据结构修改: 在月柱对象 (MonthPillar) 中，新增 yueLingSiLing 属性。

获取路径: yuanju.month.yueLingSiLing

示例:

```Json
"month": {
  "id": "mp",
  "type": "月柱",
  "value": "壬辰",
  "yueLingSiLing": "戊", // <--- 新增属性
  "gan": { ... },
  "zhi": { ... }
}
```
b. 自坐 (ZiZuo)
功能: 计算每一柱自身的天干，相对于其地支的“长生十二宫”状态。

数据结构修改: 在所有四柱对象 (OriginalPillar) 中，新增 ziZuo 属性。

获取路径: yuanju.year.ziZuo, yuanju.month.ziZuo 等。

示例:
```Json
"year": {
  "id": "yp",
  "type": "年柱",
  "value": "丙子",
  "ziZuo": "胎", // <--- 新增属性
  "gan": { ... },
  "zhi": { ... }
}
```
c. 星运 (XingYun)
功能: 计算日干（命主），相对于八字命盘中每一个地支（包括原局、大运、流年、小运）的“长生十二宫”状态。

数据结构修改: 在所有柱对象的 zhi 对象 (Zhi) 中，新增 xingYun 属性。

【注意】：为了保持结构统一，根据最新讨论，此属性已从 zhi 对象内部移至与 ziZuo 同级的柱对象 (Pillar) 的直接属性。

获取路径: yuanju.year.xingYun, dayun[1].liunian[0].xingYun 等。

示例:
```Json
"day": {
  "id": "dp",
  "type": "日柱",
  "value": "庚子",
  "ziZuo": "死",
  "xingYun": "死", // <--- 新增属性
  "gan": { ... },
  "zhi": { ... }
}
```
