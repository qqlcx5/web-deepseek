# 09 - 输入与发送（XSender）

> 需求来源：§3 F-04 用户输入  
> 优先级：P0  
> 目标：XSender 输入框集成，支持发送、指令弹窗、提及、快捷操作

## 任务清单

### 9.1 XSender 集成

- [ ] 创建 `src/components/ChatInput.vue`，使用 XSender 组件
- [ ] `v-model` 绑定输入文本
- [ ] `placeholder`：根据当前 Assistant 名称动态生成
- [ ] `@send` 事件触发消息发送流程

### 9.2 发送快捷键

- [ ] `sendMessageShortcut='Enter'`：回车发送
- [ ] `sendMessageShortcut='Ctrl+Enter'`：Ctrl+回车发送
- [ ] `sendMessageShortcut='Shift+Enter'`：Shift+回车发送
- [ ] 其他组合键换行

### 9.3 指令弹窗

- [ ] 输入 `/` 触发指令弹窗
- [ ] 弹窗展示可用指令列表（如 /clear, /export 等）
- [ ] 选择指令后填入输入框或直接执行

### 9.4 提及（Mentions）

- [ ] 输入 `@` 触发模型选择弹窗
- [ ] 弹窗按 Provider 分组展示可用模型
- [ ] 选择后插入 `@model-name` 到输入框
- [ ] 记录 `mentions` 数组到消息中

### 9.5 Token 估算

- [ ] `showInputEstimatedTokens=true` 时显示输入 Token 估算值
- [ ] 使用简单估算算法（字符数 / 4 或 tiktoken 轻量版）

### 9.6 长文本粘贴

- [ ] `pasteLongTextAsFile=true` 时，粘贴超过 `pasteLongTextThreshold` 字符的文本转为文件附件
- [ ] 转为 .txt 文件加入附件列表

### 9.7 空消息保护

- [ ] 空输入或仅空白字符时不触发发送
- [ ] 发送后清空输入框

### 9.8 快捷操作栏

- [ ] `#action-list` 插槽：附件按钮、语音输入按钮（P2）
- [ ] 附件按钮触发 Attachments 组件
- [ ] `enableQuickPanelTriggers` 控制快捷面板触发

## 验收

- XSender 发送/换行/快捷键行为正确
- 指令弹窗 `/` 触发正常
- 提及 `@` 弹窗按 Provider 分组
- Token 估算显示
- 长文本粘贴转附件
