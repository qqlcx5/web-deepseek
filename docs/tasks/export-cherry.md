# 12 - 导出（Cherry v5）

> 需求来源：§3 F-07  
> 优先级：P1  
> 目标：导出 Cherry v5 可读 JSON，默认不含 API Key

## 任务清单

### 12.1 导出数据组装

- [ ] 创建 `src/utils/exporter.ts`
- [ ] 组装 Cherry v5 JSON 外壳结构（version, llm, assistants, indexedDB, persist）
- [ ] 将 Orbit AppData 映射回 Cherry v5 格式

### 12.2 Provider 导出

- [ ] 导出 Provider + Model 列表
- [ ] 默认剔除 `apiKey`（设为空字符串）
- [ ] 用户勾选"包含 API Key"时保留

### 12.3 Assistant 导出

- [ ] 导出 defaultAssistant（isDefault=true 的 Assistant）
- [ ] 导出 assistants[]（全部 Assistant）
- [ ] 写入 `topics[]` 引用（Topic ID 列表）
- [ ] `messages` 始终为空数组

### 12.4 Topic 导出

- [ ] 导出 indexedDB.topics[]（含 messages 内联）
- [ ] 导出 message_blocks[]（从 message.blocks[] 拆出为独立数组）

### 12.5 Settings 导出

- [ ] 导出 persist.settings（白名单字段）

### 12.6 引用校验

- [ ] 导出前校验：Topic → Assistant, Message → Topic, Block → Message
- [ ] 存在无效引用时阻止下载
- [ ] 显示错误列表（引用路径 + 问题描述）

### 12.7 下载

- [ ] 生成 JSON Blob
- [ ] 触发浏览器下载（文件名：`orbit-chat-export-YYYYMMDD-HHmmss.json`）
- [ ] 默认不含 API Key 时在 UI 提示

### 12.8 UI 集成

- [ ] 创建 `src/components/ExportDialog.vue`
- [ ] 选项：是否包含 API Key（默认否）
- [ ] 导出前显示数据概览
- [ ] 校验失败时显示问题列表

## 验收

- 导出 JSON 不含 API Key（默认）
- 再次导入导出文件后数量闭环
- 导出前无效引用时下载被阻止并显示问题
- 文件名格式正确
