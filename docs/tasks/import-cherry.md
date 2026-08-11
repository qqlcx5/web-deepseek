# 11 - 导入（Cherry v5）

> 需求来源：§3 F-06, §6 导入映射详细规则  
> 优先级：P0  
> 目标：导入 Cherry Studio v5 JSON，映射为 Orbit AppData

## 任务清单

### 11.1 文件选择与解析

- [ ] 创建 `src/utils/importer.ts`
- [ ] 文件选择对话框（accept: .json）
- [ ] 读取并 JSON.parse 文件内容
- [ ] 校验顶层结构（version, llm, assistants, indexedDB, persist）

### 11.2 Provider 映射

- [ ] 遍历 `cherry.llm.providers[]`
- [ ] 按 §6.1 规则逐字段映射
- [ ] 仅导入 Provider + Model 声明字段
- [ ] 保留 apiKey（导入时保留，导出时剔除）

### 11.3 Assistant 映射

- [ ] 从 `cherry.assistants.defaultAssistant` 提取默认 Assistant
- [ ] 从 `cherry.assistants.assistants[]` 提取普通 Assistant
- [ ] 按 §6.2 规则映射字段
- [ ] `topics[]` 字段用于建立 Topic 归属索引（不直接导入到 Assistant）
- [ ] `messages` 始终为空数组（实际消息从 indexedDB.topics 导入）
- [ ] 按 ID 去重

### 11.4 Topic 映射

- [ ] 遍历 `cherry.indexedDB.topics[]`
- [ ] 按 §6.3 规则映射元数据
- [ ] 校验 `assistantId` 存在性；不存在则回退到默认 Assistant，列入 warning

### 11.5 Message 映射

- [ ] 遍历 Topic.messages[]，按 §6.4 规则映射
- [ ] status 映射：success→complete, pending→sending, error→error
- [ ] blocks 暂留空，下一步填充

### 11.6 Block 映射

- [ ] 从 `cherry.message_blocks[]` 查找
- [ ] 按 block ID 顺序内联到对应 message 的 blocks[]
- [ ] 按 §6.5 规则映射各 type 的字段
- [ ] 无法关联的 block 不进入目标数据

### 11.7 Settings 映射

- [ ] 从 `cherry.persist.settings` 提取
- [ ] 按 §6.6 规则仅导入白名单字段
- [ ] 其他字段丢弃

### 11.8 导入预览

- [ ] 解析完成后显示预览：Provider 数、Assistant 数、Topic 数、Message 数、Block 数、Warning 数
- [ ] 显示 warning 列表（无法关联的 Topic/Block）
- [ ] 确认后才执行写入

### 11.9 导入后校验

- [ ] ID 唯一性检查（Provider, Model, Assistant, Topic, Message, Block）
- [ ] Topic → Assistant 引用检查
- [ ] Message → Topic 引用检查
- [ ] block → Message 引用检查
- [ ] 默认 Assistant 唯一性检查
- [ ] 校验失败时显示问题列表，阻止写入

### 11.10 UI 集成

- [ ] 创建 `src/components/ImportDialog.vue`
- [ ] 文件选择 → 解析 → 预览 → 确认 → 写入 → 成功/失败提示

## 验收

- 导入多 Assistant Cherry v5 文件后 Topic 归属/标题/时间一致
- 无法关联的 Topic 回退到默认 Assistant 并列入 warning
- 无法关联的 block 不进入目标数据
- 导入预览数量准确
- 导入后校验通过
