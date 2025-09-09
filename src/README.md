# Jest快照格式化工具

这个工具用于将Jest快照文件从多行格式转换为更紧凑的单行格式，提高快照文件的可读性和维护性。

## 主要功能

1. **格式化**：将多行对象转换为单行，减少文件大小，提高可读性
2. **查看**：快速查看快照文件内容
3. **比较**：比较原始和格式化后的文件大小和内容差异
4. **应用**：将格式化后的文件应用到原始文件

## 使用方法

```bash
#运行Jest测试创建快照
npm test -- -u

#运行测试检查是否匹配现有快照
npm test

#运行测试检查是否匹配现有快照
npm test -- src/baziService.test.js

# 显示帮助信息
node snapshotFormatter.js help

# 格式化快照文件
node snapshotFormatter.js format [文件路径]
node src/snapshotFormatter.js format src/__snapshots__/baziService.test.js.snap

# 查看文件内容
node snapshotFormatter.js view [文件路径]

# 比较原始和格式化后的文件
node snapshotFormatter.js compare [文件路径]

# 将格式化后的文件应用到原始文件
node snapshotFormatter.js apply [文件路径]
node src/snapshotFormatter.js apply src/__snapshots__/baziService.test.js.snap
```

如果不提供文件路径，将处理 `__snapshots__` 目录中的所有快照文件。

## 格式化示例

### 原始格式

```json
{
  "gan": "丙",
  "shishen": "正官",
  "type": "本气",
}
```

### 格式化后

```json
{"gan": "丙", "shishen": "正官", "type": "本气",}
```

## 注意事项

1. 工具会自动创建备份文件(.bak)，以防格式化出现问题
2. 格式化后的文件默认保存为.formatted.snap，不会直接覆盖原文件
3. 使用apply命令将格式化内容应用到原始文件后，请重新运行Jest测试以确保快照匹配

## 高级用法

可以根据需要修改formatContent函数中的正则表达式，添加更多自定义的格式化规则。 