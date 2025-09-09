# 八字后端系统扩展计划

## 项目现状

### 当前功能
- ✅ **公历输入支持**: 支持输入公历生日，计算完整的八字信息
- ✅ **基本八字计算**: 年柱、月柱、日柱、时柱计算
- ✅ **大运流年**: 起运、大运、流年、小运计算
- ✅ **神煞关系**: 刑冲合害等关系计算
- ✅ **数据库集成**: 使用 SQLite 数据库存储四柱和节气数据
- ✅ **前端模拟**: 通过 `update-mock` 命令生成前端测试数据

### 技术栈
- **后端**: Node.js + ES Modules
- **数据库**: SQLite3 (bazi_data.db + SolarTerms.db)
- **测试**: Jest
- **数据文件**: JSON 规则文件 (NA_YIN.js, SHI_SHEN_GAN.js, ZHI_HIDE_GAN.js 等)

### 核心文件结构
```
src/
├── baziService.js          # 主服务，八字计算核心
├── databaseService.js      # 数据库操作服务
├── harmCalculator.js       # 刑冲合害关系计算
├── shenshaCalculator.js    # 神煞计算
├── auxiliaryCalculator.js  # 辅助特征计算
└── update-frontend-mock.js # 前端模拟数据生成

data/
├── bazi_data.db           # 四柱数据数据库 (130MB+)
├── SolarTerms.db          # 节气数据数据库
└── *.js                   # 各种规则数据文件
```

## 扩展目标

### 主要目标：支持多种输入格式
目前仅支持公历输入，需要扩展支持：

1. **农历生日输入** - 用户输入农历年月日时
2. **四柱输入** - 用户直接输入年柱、月柱、日柱、时柱、性别

### 技术挑战
- **四柱多义性**: 同一组四柱可能对应多个不同的公历日期
- **输入验证**: 需要验证农历和四柱输入的合法性
- **统一接口**: 所有输入最终需要转换为标准公历格式进行处理

## 数据库分析

### bazi_data.db 结构
```sql
CREATE TABLE Pillars (
    gregorian_datetime TEXT PRIMARY KEY,     -- 公历时间 'YYYY-MM-DD HH:MM:SS'
    year_pillar TEXT NOT NULL,               -- 年柱 (如 '甲子')
    month_pillar TEXT NOT NULL,              -- 月柱
    day_pillar TEXT NOT NULL,                -- 日柱
    hour_pillar TEXT NOT NULL,               -- 时柱
    lunar_date_str TEXT,                     -- 农历日期字符串
    tai_yuan TEXT NOT NULL,                  -- 胎元
    ming_gong TEXT NOT NULL,                 -- 命宫
    shen_gong TEXT NOT NULL                  -- 身宫
);
```

### 数据特点
- 数据覆盖从 1900 年开始
- 每小时一条记录，包含完整的四柱信息
- 农历日期格式如：'一八九九年腊月初一'

## 实施计划

### Phase 1: 核心模块开发

#### 1. 输入处理模块 (`src/inputProcessor.js`)
```javascript
// 主要功能：
- detectInputType(input) - 自动检测输入类型
- validateGregorian(dateStr) - 验证公历输入
- validateLunar(lunarData) - 验证农历输入  
- validatePillars(pillars) - 验证四柱输入
- normalizeToGregorian(input) - 统一转换为公历
```

#### 2. 数据库服务增强 (`src/databaseService.js`)
```javascript
// 需要实现：
- findDatesByLunar(lunarData) - 农历转公历查询
- findDatesByPillars(pillars) - 四柱反查公历日期
- 添加输入验证和错误处理
```

#### 3. 命令行工具更新 (`src/update-frontend-mock.js`)
```javascript
// 支持新格式：
// 公历: "1996-04-13 00:18:00"
// 农历: "lunar:1996-02-26" (需要定义格式)
// 四柱: "pillars:丙子-壬辰-庚申-丙子"
```

### Phase 2: 集成测试

#### 4. 主服务集成 (`src/baziService.js`)
- 集成输入处理模块
- 保持现有 API 不变
- 添加多日期选择处理逻辑

#### 5. 测试用例
- 编写各种输入格式的测试用例
- 验证四柱多义性场景
- 确保向后兼容性

### Phase 3: 文档和部署

#### 6. API 文档
- 更新使用说明
- 添加新输入格式示例

#### 7. 错误处理
- 统一的错误响应格式
- 详细的错误信息

## 技术细节

### 输入格式定义

#### 公历输入 (现有)
```
"1996-04-13 00:18:00"
```

#### 农历输入 (新)
```
格式1: "lunar:1996-02-26"           # 年月日
格式2: "lunar:1996-02-26-23"        # 年月日时
格式3: "lunar:1996-02-26-23-true"   # 年月日时-是否闰月
```

#### 四柱输入 (新)
```
格式1: "pillars:丙子-壬辰-庚申-丙子"
格式2: "丙子 壬辰 庚申 丙子"
```

### 多日期处理流程
```
用户输入四柱 → 数据库查询 → 找到多个公历日期 → 返回选项列表 → 用户选择 → 继续计算
```

## 风险评估

1. **四柱多义性**: 需要设计良好的用户交互流程
2. **性能考虑**: 四柱反查可能需要优化查询
3. **数据完整性**: 确保数据库覆盖所有可能的四柱组合
4. **错误处理**: 各种无效输入场景的处理

## 后续优化方向

1. **缓存机制**: 对常见查询结果进行缓存
2. **批量处理**: 支持批量八字计算
3. **历史记录**: 保存用户的计算历史
4. **API 扩展**: 提供更丰富的查询接口

## 开发注意事项

1. **保持向后兼容**: 现有公历输入方式必须完全正常工作
2. **错误信息友好**: 为用户提供清晰的错误提示
3. **性能监控**: 注意数据库查询性能
4. **测试覆盖**: 确保所有新功能都有充分的测试

---